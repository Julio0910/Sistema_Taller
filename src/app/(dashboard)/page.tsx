"use client";

import { useState, useEffect, useMemo } from "react";
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator"; // Importado en el lugar correcto
import { ShoppingCart, Package, BarChart3, Users, Crown, Star, CreditCard } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query } from "firebase/firestore";

// --- Interfaces ---
interface CartItem { name: string; quantity: number; }
interface Customer { name: string; }
interface Invoice { items: CartItem[]; customer?: Customer; total: number; }

export default function HomePage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "invoices"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const invoicesData: Invoice[] = snapshot.docs.map(doc => doc.data() as Invoice);
      setInvoices(invoicesData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- Lógica para calcular los rankings ---
  const { topProducts, topCustomers } = useMemo(() => {
    const productSales: { [key: string]: number } = {};
    const customerSales: { [key: string]: number } = {};

    for (const invoice of invoices) {
      for (const item of invoice.items) {
        productSales[item.name] = (productSales[item.name] || 0) + item.quantity;
      }
      if (invoice.customer?.name) {
        customerSales[invoice.customer.name] = (customerSales[invoice.customer.name] || 0) + invoice.total;
      }
    }

    const sortedProducts = Object.entries(productSales)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([name, value]) => ({ name, value: `${value} unidades` }));

    const sortedCustomers = Object.entries(customerSales)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([name, value]) => ({ name, value: `L. ${value.toFixed(2)}` }));
      
    return { topProducts: sortedProducts, topCustomers: sortedCustomers };
  }, [invoices]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Dashboard de Análisis</h1>
      <p className="text-muted-foreground mb-8">
        Métricas clave basadas en tu historial de ventas.
      </p>

      {/* --- SECCIÓN DE ESTADÍSTICAS AVANZADAS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos Más Vendidos</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <p>Calculando...</p> : topProducts.length > 0 ? (
              <ul className="space-y-2">
                {topProducts.map((item, index) => (
                  <li key={index} className="flex justify-between text-sm">
                    <span className="font-medium">{index + 1}. {item.name}</span>
                    <span className="text-muted-foreground">{item.value}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-muted-foreground">No hay suficientes datos.</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mejores Clientes</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loading ? <p>Calculando...</p> : topCustomers.length > 0 ? (
              <ul className="space-y-2">
                {topCustomers.map((item, index) => (
                  <li key={index} className="flex justify-between text-sm">
                    <span className="font-medium">{index + 1}. {item.name}</span>
                    <span className="text-muted-foreground">{item.value}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-muted-foreground">No hay suficientes datos.</p>}
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* --- SECCIÓN DE NAVEGACIÓN --- */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Módulos del Sistema</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/pos"><Card className="hover:border-primary hover:shadow-lg transition-all"><CardHeader><ShoppingCart className="h-8 w-8 text-primary mb-2" /><CardTitle>Punto de Venta</CardTitle><CardDescription>Iniciar una nueva venta.</CardDescription></CardHeader></Card></Link>
          <Link href="/inventario"><Card className="hover:border-primary hover:shadow-lg transition-all"><CardHeader><Package className="h-8 w-8 text-primary mb-2" /><CardTitle>Inventario</CardTitle><CardDescription>Gestionar productos.</CardDescription></CardHeader></Card></Link>
          <Link href="/clientes"><Card className="hover:border-primary hover:shadow-lg transition-all"><CardHeader><Users className="h-8 w-8 text-primary mb-2" /><CardTitle>Clientes</CardTitle><CardDescription>Administrar clientes.</CardDescription></CardHeader></Card></Link>
          <Link href="/gastos"><Card className="hover:border-primary hover:shadow-lg transition-all"><CardHeader><CreditCard className="h-8 w-8 text-primary mb-2" /><CardTitle>Gestión de Gastos</CardTitle><CardDescription>Registrar egresos.</CardDescription></CardHeader></Card></Link>
          <Link href="/reportes"><Card className="hover:border-primary hover:shadow-lg transition-all"><CardHeader><BarChart3 className="h-8 w-8 text-primary mb-2" /><CardTitle>Reportes</CardTitle><CardDescription>Ver historial de ventas.</CardDescription></CardHeader></Card></Link>
        </div>
      </div>
    </div>
  );
}