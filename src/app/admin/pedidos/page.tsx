
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ListOrdered, Info } from 'lucide-react'; // Using Info for informational message
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
// import { Badge } from '@/components/ui/badge'; // For status, if we implement it later
// import { useState, useEffect } from 'react'; // If we were fetching data in the future

// Mock data structure if we were to display it later - for planning
// interface LoggedOrder {
//   id: string;
//   timestamp: string;
//   customerInfo?: string; 
//   items: Array<{ name: string; size: string; quantity: number }>;
//   status: 'pending' | 'processed' | 'shipped';
// }

export default function AdminPedidosPage() {
  // const [orders, setOrders] = useState<LoggedOrder[]>([]);
  // const [isLoading, setIsLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //   // TODO: Implement fetching logged orders from backend when that feature is built.
  //   // For now, this page is informational.
  //   // setIsLoading(false); 
  // }, []);

  // const handleMarkAsProcessed = (orderId: string) => {
  //   // TODO: Implement logic to update order status in the future
  //   console.log("Marking order as processed:", orderId);
  // };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground font-headline">
            Visualizar Pedidos (WhatsApp)
          </h2>
          <p className="text-muted-foreground mt-1">
            Acompanhe os pedidos iniciados através do WhatsApp.
          </p>
        </div>
        <Button asChild variant="outline" className="w-full sm:w-auto border-foreground/30 text-foreground hover:bg-foreground/10">
          <Link href="/admin/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Link>
        </Button>
      </div>

      <div className="glass-card p-6 md:p-8 rounded-xl shadow-xl">
        <div className="mb-6 p-4 border border-primary/30 dark:border-primary/70 bg-primary/10 dark:bg-primary/20 rounded-md text-primary dark:text-primary/90">
          <Info className="inline-block h-5 w-5 mr-2 align-middle" />
          <strong className="font-semibold">Nota Importante:</strong> Esta seção é designada para listar os pedidos que são finalizados pelo cliente através do botão "Finalizar Pedido pelo WhatsApp".
          Para que os pedidos apareçam aqui, é necessário implementar uma funcionalidade no backend que salve uma cópia da mensagem gerada para o WhatsApp em nosso banco de dados.
          Atualmente, o acompanhamento e gerenciamento dos pedidos ocorrem diretamente na sua conversa do WhatsApp.
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent dark:hover:bg-transparent border-b border-border/50">
                <TableHead className="text-foreground/80">Data/Hora</TableHead>
                <TableHead className="text-foreground/80">Itens do Pedido</TableHead>
                <TableHead className="text-foreground/80">Status</TableHead>
                <TableHead className="text-right text-foreground/80">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-12">
                  <ListOrdered className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                  <p className="font-medium text-lg">Nenhum pedido registrado no sistema ainda.</p>
                  <p className="text-sm mt-1">(A funcionalidade de log e exibição de pedidos será implementada futuramente.)</p>
                </TableCell>
              </TableRow>
              {/* 
              // Example of how a row might look in the future - commented out for now
              <TableRow className="border-b border-border/30 hover:bg-muted/20 dark:hover:bg-muted/10 align-top">
                <TableCell className="font-medium text-foreground">2024-07-30 10:30</TableCell>
                <TableCell className="text-xs">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Produto Exemplo A | Tam: 40 | Qtd: 1</li>
                    <li>Produto Exemplo B | Tam: 42 | Qtd: 2</li>
                  </ul>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="border-yellow-500 text-yellow-600">Pendente</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 hover:bg-primary/10 text-xs">
                    Marcar como Processado
                  </Button>
                </TableCell>
              </TableRow>
              */}
            </TableBody>
          </Table>
        </div>
         {/* 
         // Placeholder for CSV export button to be added when data is available
         <div className="mt-8 text-right">
            <Button variant="outline" disabled>
              Exportar para CSV (Em Breve)
            </Button>
          </div> 
          */}
      </div>
    </div>
  );
}
