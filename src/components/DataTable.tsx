import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DataTableProps {
  data: any[][];
  fileName: string;
}

export const DataTable = ({ data, fileName }: DataTableProps) => {
  if (!data || data.length === 0) return null;

  const headers = data[0] || [];
  const rows = data.slice(1);

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>Data Preview</span>
          <span className="text-sm font-normal text-muted-foreground">
            ({fileName})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96 w-full">
          <Table>
            <TableHeader>
              <TableRow>
                {headers.map((header: any, index: number) => (
                  <TableHead key={index} className="font-semibold">
                    {header || `Column ${index + 1}`}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.slice(0, 100).map((row: any[], rowIndex: number) => (
                <TableRow key={rowIndex}>
                  {headers.map((_: any, cellIndex: number) => (
                    <TableCell key={cellIndex}>
                      {row[cellIndex] || ''}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
        {rows.length > 100 && (
          <p className="text-sm text-muted-foreground mt-2">
            Showing first 100 rows of {rows.length} total rows
          </p>
        )}
      </CardContent>
    </Card>
  );
};