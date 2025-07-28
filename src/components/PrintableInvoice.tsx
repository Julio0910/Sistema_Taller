import React from 'react';

interface CartItem { id: string; name: string; salePrice: number; quantity: number; }
interface Customer { id: string; name: string; rtn: string; phone: string; }
interface InvoiceProps {
  invoiceData: {
    items: CartItem[];
    subtotal: number;
    isv: number;
    total: number;
    invoiceNumber: string;
    customer?: Customer | null;
  };
}

export const PrintableInvoice = ({ invoiceData }: InvoiceProps) => {
  const { items, subtotal, isv, total, invoiceNumber, customer } = invoiceData;

  return (
    <div id="printable-invoice" className="p-4 bg-white text-black font-mono text-xs">
      <div className="text-center">
        <h2 className="text-lg font-bold">Taller de Repuestos</h2>
        <p>El Progreso, Yoro</p>
        <p>Tel: 9999-9999</p>
        <p className="border-t border-b border-dashed border-black my-2 py-1">
          FACTURA #{invoiceNumber}
        </p>
      </div>

      {/* Sección de datos del cliente */}
      {customer && (
        <div className="mt-4">
          <p><strong>Cliente:</strong> {customer.name}</p>
          <p><strong>RTN:</strong> {customer.rtn}</p>
        </div>
      )}

      <div className="mt-4">
        <div className="grid grid-cols-5 gap-1 font-bold">
          <div className="col-span-2">Desc.</div>
          <div>Cant.</div>
          <div>Precio</div>
          <div className="text-right">Total</div>
        </div>
        {items.map(item => (
          <div key={item.id} className="grid grid-cols-5 gap-1">
            <div className="col-span-2">{item.name}</div>
            <div>{item.quantity}</div>
            <div>{item.salePrice.toFixed(2)}</div>
            <div className="text-right">{(item.quantity * item.salePrice).toFixed(2)}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-2 border-t border-dashed border-black">
        <div className="flex justify-between"><span>SUBTOTAL:</span><span>L. {subtotal.toFixed(2)}</span></div>
        <div className="flex justify-between"><span>ISV (15%):</span><span>L. {isv.toFixed(2)}</span></div>
        <div className="flex justify-between font-bold text-lg mt-1"><span>TOTAL:</span><span>L. {total.toFixed(2)}</span></div>
      </div>
      
      <div className="text-center mt-6">
        <p>¡Gracias por su compra!</p>
        <p className="text-gray-600">Fecha: {new Date().toLocaleString('es-HN')}</p>
      </div>
    </div>
  );
};