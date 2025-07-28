"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, addDoc, doc, runTransaction, orderBy } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Separator } from "@/components/ui/separator";
import { Search, XCircle, ChevronsUpDown, Check } from "lucide-react";
import { PrintableInvoice } from "@/components/PrintableInvoice";
import { cn } from "@/lib/utils";

// --- Interfaces ---
interface Product { id: string; name: string; salePrice: number; stock: number; }
interface CartItem extends Product { quantity: number; }
interface Customer { id: string; name: string; rtn: string; phone: string; }
interface InvoiceData { items: CartItem[]; subtotal: number; isv: number; total: number; invoiceNumber: string; customer?: Customer | null; }

export default function PosPage() {
  // --- Estados ---
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastSaleData, setLastSaleData] = useState<InvoiceData | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [openCombobox, setOpenCombobox] = useState(false);

  const componentToPrintRef = useRef<HTMLDivElement>(null);
  
  // Cargar productos y clientes
  useEffect(() => {
    const productsQuery = query(collection(db, "products"));
    const customersQuery = query(collection(db, "customers"), orderBy("name", "asc"));

    const unsubProducts = onSnapshot(productsQuery, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    });
    const unsubCustomers = onSnapshot(customersQuery, (snapshot) => {
      setCustomers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer)));
    });

    return () => {
      unsubProducts();
      unsubCustomers();
    };
  }, []);

  // Lógica de búsqueda y carrito (sin cambios)
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return [];
    return products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm, products]);
  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) return prevCart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };
  const removeFromCart = (productId: string) => setCart(prevCart => prevCart.filter(item => item.id !== productId));
  
  // Cálculos de la venta (sin cambios)
  const total = useMemo(() => cart.reduce((sum, item) => sum + item.salePrice * item.quantity, 0), [cart]);
  const isv = total * 0.15;
  const grandTotal = total + isv;

  const handleFinalizeSale = async () => {
    if (cart.length === 0) return alert("El carrito está vacío.");
    setIsProcessing(true);
    try {
      const newInvoiceRef = doc(collection(db, "invoices"));
      await runTransaction(db, async (transaction) => {
        const productsToUpdate: { ref: any; newStock: number }[] = [];
        for (const item of cart) {
          const productRef = doc(db, "products", item.id);
          const productDoc = await transaction.get(productRef);
          if (!productDoc.exists() || productDoc.data().stock < item.quantity) throw new Error(`Stock insuficiente para ${item.name}.`);
          const newStock = productDoc.data().stock - item.quantity;
          productsToUpdate.push({ ref: productRef, newStock });
        }
        transaction.set(newInvoiceRef, {
          items: cart.map(item => ({...item})),
          subtotal: total,
          isv: isv,
          total: grandTotal,
          createdAt: new Date(),
          customer: selectedCustomer ? { id: selectedCustomer.id, name: selectedCustomer.name, rtn: selectedCustomer.rtn } : null
        });
        for (const prod of productsToUpdate) transaction.update(prod.ref, { stock: prod.newStock });
      });
      
      setLastSaleData({ items: [...cart], subtotal: total, isv: isv, total: grandTotal, invoiceNumber: newInvoiceRef.id.substring(0, 6).toUpperCase(), customer: selectedCustomer });
      setCart([]);
      setSelectedCustomer(null);
    } catch (e: any) {
      alert(`Hubo un error al procesar la venta: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (lastSaleData) {
      window.print();
      setLastSaleData(null);
    }
  }, [lastSaleData]);

  return (
    <>
      <div className="main-content grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-150px)]">
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader><CardTitle>Buscar Productos</CardTitle></CardHeader>
          <CardContent className="flex-grow flex flex-col">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20}/>
              <Input type="text" placeholder="Escribe el nombre del producto..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="mt-4 flex-grow overflow-y-auto pr-2">
              <ul className="space-y-2">
                {filteredProducts.map(product => (
                  <li key={product.id} className="flex justify-between items-center p-2 rounded-lg hover:bg-secondary">
                    <div>
                      <p className="font-semibold">{product.name}</p>
                      <p className="text-sm text-muted-foreground">Stock: {product.stock} | L. {product.salePrice.toFixed(2)}</p>
                    </div>
                    <Button onClick={() => addToCart(product)} disabled={product.stock <= 0} size="sm">{product.stock > 0 ? 'Agregar' : 'Sin Stock'}</Button>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Venta Actual</CardTitle>
            {/* Componente para seleccionar cliente */}
            <div className="pt-2">
              <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" aria-expanded={openCombobox} className="w-full justify-between">
                    {selectedCustomer ? selectedCustomer.name : "Seleccionar cliente..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                  <Command>
                    <CommandInput placeholder="Buscar cliente..." />
                    <CommandList>
                      <CommandEmpty>No se encontró el cliente.</CommandEmpty>
                      <CommandGroup>
                        {customers.map((customer) => (
                          <CommandItem
                            key={customer.id}
                            value={customer.name}
                            onSelect={() => {
                              setSelectedCustomer(customer);
                              setOpenCombobox(false);
                            }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", selectedCustomer?.id === customer.id ? "opacity-100" : "opacity-0")}/>
                            {customer.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </CardHeader>
          <CardContent className="flex-grow overflow-y-auto">
            {cart.length === 0 ? <p className="text-muted-foreground text-center mt-10">El carrito está vacío</p> : (
              <ul className="space-y-3">
                {cart.map(item => (
                  <li key={item.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-sm">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.quantity} x L. {item.salePrice.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm">L. {(item.quantity * item.salePrice).toFixed(2)}</p>
                      <Button onClick={() => removeFromCart(item.id)} variant="ghost" size="icon" className="h-7 w-7"><XCircle size={16} className="text-destructive"/></Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
          <CardFooter className="flex-col items-stretch space-y-2 border-t pt-4">
              <div className="flex justify-between text-sm"><p className="text-muted-foreground">Subtotal:</p><p>L. {total.toFixed(2)}</p></div>
              <div className="flex justify-between text-sm"><p className="text-muted-foreground">ISV (15%):</p><p>L. {isv.toFixed(2)}</p></div>
              <Separator className="my-2"/>
              <div className="flex justify-between font-bold text-lg"><p>Total:</p><p>L. {grandTotal.toFixed(2)}</p></div>
              <Button size="lg" className="w-full mt-4" onClick={handleFinalizeSale} disabled={isProcessing || cart.length === 0}>{isProcessing ? "Procesando..." : "Finalizar Venta"}</Button>
          </CardFooter>
        </Card>
      </div>
      {lastSaleData && <PrintableInvoice invoiceData={lastSaleData} />}
    </>
  );
}