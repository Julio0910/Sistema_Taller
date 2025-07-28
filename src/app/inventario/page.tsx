"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { PlusCircle, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore";

interface Product { id: string; name: string; sku: string; costPrice: number; salePrice: number; stock: number; }

export default function InventarioPage() {
  const [open, setOpen] = useState(false);
  const [nombre, setNombre] = useState("");
  const [sku, setSku] = useState("");
  const [costo, setCosto] = useState(0);
  const [precio, setPrecio] = useState(0);
  const [stock, setStock] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("name", "asc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const productsData: Product[] = [];
      querySnapshot.forEach((doc) => productsData.push({ id: doc.id, ...doc.data() } as Product));
      setProducts(productsData);
    });
    return () => unsubscribe();
  }, []);
  
  useEffect(() => {
    if (editingProduct) {
      setNombre(editingProduct.name);
      setSku(editingProduct.sku);
      setCosto(editingProduct.costPrice);
      setPrecio(editingProduct.salePrice);
      setStock(editingProduct.stock);
    } else {
      setNombre(""); setSku(""); setCosto(0); setPrecio(0); setStock(0);
    }
  }, [editingProduct]);

  const handleSaveProduct = async () => {
    if (!nombre || precio <= 0) return alert("Por favor, llena al menos el nombre y el precio de venta.");
    setIsSaving(true);
    const productData = { name: nombre, sku: sku, costPrice: Number(costo), salePrice: Number(precio), stock: Number(stock) };
    try {
      if (editingProduct) {
        await updateDoc(doc(db, "products", editingProduct.id), productData);
      } else {
        await addDoc(collection(db, "products"), { ...productData, category: "General" });
      }
      handleCloseModal();
    } catch (e) {
      alert("Hubo un error al guardar el producto.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      try {
        await deleteDoc(doc(db, "products", productId));
      } catch (e) {
        alert("Hubo un error al eliminar el producto.");
      }
    }
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setOpen(true);
  };
  
  const handleCloseModal = () => {
    setOpen(false);
    setEditingProduct(null);
  };

  return (
    <div>
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Inventario de Productos</h1>
          <p className="text-muted-foreground mt-2">Gestiona todos los productos de tu negocio.</p>
        </div>
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleCloseModal()}>
          <DialogTrigger asChild>
            <Button onClick={() => setOpen(true)}>
              <PlusCircle className="mr-2 h-5 w-5" />
              Agregar Producto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Editar Producto' : 'Agregar Nuevo Producto'}</DialogTitle>
              <DialogDescription>Llena los datos del producto.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="name" className="text-right">Nombre</Label><Input id="name" value={nombre} onChange={(e) => setNombre(e.target.value)} className="col-span-3"/></div>
              <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="sku" className="text-right">SKU</Label><Input id="sku" value={sku} onChange={(e) => setSku(e.target.value)} className="col-span-3"/></div>
              <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="costo" className="text-right">Costo (L)</Label><Input id="costo" type="number" value={costo} onChange={(e) => setCosto(Number(e.target.value))} className="col-span-3"/></div>
              <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="precio" className="text-right">Precio Venta (L)</Label><Input id="precio" type="number" value={precio} onChange={(e) => setPrecio(Number(e.target.value))} className="col-span-3"/></div>
              <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="stock" className="text-right">Stock</Label><Input id="stock" type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} className="col-span-3"/></div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleSaveProduct} disabled={isSaving}>{isSaving ? "Guardando..." : "Guardar Cambios"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>
      <Card>
        <CardHeader><CardTitle>Lista de Productos</CardTitle><CardDescription>Todos los productos registrados en tu sistema.</CardDescription></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">SKU</TableHead><TableHead>Nombre</TableHead><TableHead className="text-right">Precio Venta (L)</TableHead><TableHead className="text-right">Stock</TableHead><TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length > 0 ? (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.sku || 'N/A'}</TableCell><TableCell>{product.name}</TableCell><TableCell className="text-right">{product.salePrice.toFixed(2)}</TableCell><TableCell className="text-right">{product.stock}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Abrir menú</span><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditClick(product)}><Pencil className="mr-2 h-4 w-4" /><span>Editar</span></DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteProduct(product.id)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" /><span>Eliminar</span></DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">Aún no hay productos. ¡Agrega el primero!</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}