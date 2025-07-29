import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShoppingCart, Package, BarChart3 } from "lucide-react";

export default function HomePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Bienvenido al Sistema de Gestión</h1>
      <p className="text-muted-foreground mb-8">
        Selecciona una opción para comenzar a trabajar.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/pos">
          <Card className="hover:border-primary hover:shadow-lg transition-all">
            <CardHeader>
              <ShoppingCart className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Punto de Venta (POS)</CardTitle>
              <CardDescription>
                Inicia una nueva venta, busca productos y genera facturas.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/inventario">
          <Card className="hover:border-primary hover:shadow-lg transition-all">
            <CardHeader>
              <Package className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Gestión de Inventario</CardTitle>
              <CardDescription>
                Agrega, visualiza, edita y elimina productos.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Card className="opacity-50 cursor-not-allowed">
          <CardHeader>
            <BarChart3 className="h-8 w-8 text-muted-foreground mb-2" />
            <CardTitle>Reportes</CardTitle>
            <CardDescription>
              Visualiza reportes de ventas y análisis de inventario. (Próximamente)
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}