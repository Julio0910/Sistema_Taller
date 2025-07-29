"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { PlusCircle, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore";

// Interfaz para la estructura de un gasto
interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: Timestamp;
}

const expenseCategories = ["Servicios", "Salarios", "Repuestos", "Alquiler", "Marketing", "Otros"];

export default function GastosPage() {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  useEffect(() => {
    const q = query(collection(db, "expenses"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense)));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (editingExpense) {
      setDescription(editingExpense.description);
      setAmount(editingExpense.amount);
      setCategory(editingExpense.category);
    } else {
      setDescription(""); setAmount(0); setCategory("");
    }
  }, [editingExpense]);

  const handleSaveExpense = async () => {
    if (!description || amount <= 0 || !category) {
      alert("Por favor, completa todos los campos.");
      return;
    }
    setIsSaving(true);
    const expenseData = { description, amount: Number(amount), category, date: new Date() };
    try {
      if (editingExpense) {
        await updateDoc(doc(db, "expenses", editingExpense.id), expenseData);
      } else {
        await addDoc(collection(db, "expenses"), expenseData);
      }
      handleCloseModal();
    } catch (e) {
      alert("Hubo un error al guardar el gasto.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este gasto?")) {
      try {
        await deleteDoc(doc(db, "expenses", expenseId));
      } catch (e) {
        alert("Hubo un error al eliminar el gasto.");
      }
    }
  };

  const handleEditClick = (expense: Expense) => {
    setEditingExpense(expense);
    setOpen(true);
  };
  
  const handleCloseModal = () => {
    setOpen(false);
    setEditingExpense(null);
  };

  return (
    <div>
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Gastos</h1>
          <p className="text-muted-foreground mt-2">Registra todos los egresos de tu negocio.</p>
        </div>
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleCloseModal()}>
          <DialogTrigger asChild><Button onClick={() => setOpen(true)}><PlusCircle className="mr-2 h-5 w-5" />Agregar Gasto</Button></DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingExpense ? 'Editar Gasto' : 'Agregar Nuevo Gasto'}</DialogTitle>
              <DialogDescription>Completa la información del egreso.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="desc" className="text-right">Descripción</Label><Input id="desc" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3"/></div>
              <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="amount" className="text-right">Monto (L)</Label><Input id="amount" type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="col-span-3"/></div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Categoría</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="col-span-3"><SelectValue placeholder="Selecciona una categoría" /></SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter><Button type="submit" onClick={handleSaveExpense} disabled={isSaving}>{isSaving ? "Guardando..." : "Guardar Gasto"}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </header>
      <Card>
        <CardHeader><CardTitle>Historial de Gastos</CardTitle><CardDescription>Todos los gastos registrados, del más reciente al más antiguo.</CardDescription></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead><TableHead>Descripción</TableHead><TableHead>Categoría</TableHead><TableHead className="text-right">Monto</TableHead><TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.length > 0 ? (
                expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{new Date(expense.date.seconds * 1000).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{expense.description}</TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell className="text-right">L. {expense.amount.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditClick(expense)}><Pencil className="mr-2 h-4 w-4" /><span>Editar</span></DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteExpense(expense.id)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" /><span>Eliminar</span></DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={5} className="h-24 text-center">Aún no has registrado ningún gasto.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}