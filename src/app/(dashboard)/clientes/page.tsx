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

// Interfaz para la estructura de un cliente
interface Customer {
  id: string;
  name: string;
  rtn: string;
  phone: string;
}

export default function ClientesPage() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [rtn, setRtn] = useState("");
  const [phone, setPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Leer clientes de la base de datos
  useEffect(() => {
    const q = query(collection(db, "customers"), orderBy("name", "asc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const customersData: Customer[] = [];
      querySnapshot.forEach((doc) => {
        customersData.push({ id: doc.id, ...doc.data() } as Customer);
      });
      setCustomers(customersData);
    });
    return () => unsubscribe();
  }, []);
  
  // Rellenar formulario al editar
  useEffect(() => {
    if (editingCustomer) {
      setName(editingCustomer.name);
      setRtn(editingCustomer.rtn);
      setPhone(editingCustomer.phone);
    } else {
      setName(""); setRtn(""); setPhone("");
    }
  }, [editingCustomer]);

  // Guardar (Crear o Actualizar)
  const handleSaveCustomer = async () => {
    if (!name) {
      alert("El nombre del cliente es obligatorio.");
      return;
    }
    setIsSaving(true);
    const customerData = { name, rtn, phone };
    try {
      if (editingCustomer) {
        await updateDoc(doc(db, "customers", editingCustomer.id), customerData);
      } else {
        await addDoc(collection(db, "customers"), customerData);
      }
      handleCloseModal();
    } catch (e) {
      alert("Hubo un error al guardar el cliente.");
    } finally {
      setIsSaving(false);
    }
  };

  // Eliminar
  const handleDeleteCustomer = async (customerId: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este cliente?")) {
      try {
        await deleteDoc(doc(db, "customers", customerId));
      } catch (e) {
        alert("Hubo un error al eliminar el cliente.");
      }
    }
  };

  const handleEditClick = (customer: Customer) => {
    setEditingCustomer(customer);
    setOpen(true);
  };
  
  const handleCloseModal = () => {
    setOpen(false);
    setEditingCustomer(null);
  };

  return (
    <div>
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Clientes</h1>
          <p className="text-muted-foreground mt-2">Agrega, edita y busca a tus clientes.</p>
        </div>
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleCloseModal()}>
          <DialogTrigger asChild>
            <Button onClick={() => setOpen(true)}>
              <PlusCircle className="mr-2 h-5 w-5" />
              Agregar Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingCustomer ? 'Editar Cliente' : 'Agregar Nuevo Cliente'}</DialogTitle>
              <DialogDescription>Llena los datos del cliente.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="name" className="text-right">Nombre</Label><Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3"/></div>
              <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="rtn" className="text-right">RTN</Label><Input id="rtn" value={rtn} onChange={(e) => setRtn(e.target.value)} className="col-span-3"/></div>
              <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="phone" className="text-right">Teléfono</Label><Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="col-span-3"/></div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleSaveCustomer} disabled={isSaving}>{isSaving ? "Guardando..." : "Guardar Cambios"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>
      <Card>
        <CardHeader><CardTitle>Lista de Clientes</CardTitle><CardDescription>Todos los clientes registrados en tu sistema.</CardDescription></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead><TableHead>RTN</TableHead><TableHead>Teléfono</TableHead><TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length > 0 ? (
                customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.rtn || 'N/A'}</TableCell>
                    <TableCell>{customer.phone || 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Abrir menú</span><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditClick(customer)}><Pencil className="mr-2 h-4 w-4" /><span>Editar</span></DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteCustomer(customer.id)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" /><span>Eliminar</span></DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">Aún no hay clientes. ¡Agrega el primero!</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}