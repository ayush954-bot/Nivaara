import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Download, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import Papa from "papaparse";

interface ParsedProperty {
  title: string;
  description: string;
  location: string;
  propertyType: "Flat" | "Land" | "Office" | "Shop" | "Rental";
  status: "Ready" | "Under-Construction";
  price: number;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  builder?: string;
  // imageUrl removed - images can be added via edit after import
  featured?: boolean;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: { row: number; error: string }[];
}

export default function BulkImport() {
  const [parsedData, setParsedData] = useState<ParsedProperty[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const bulkImportMutation = trpc.admin.properties.bulkImport.useMutation();

  const downloadTemplate = () => {
      const template = `title,description,location,propertyType,status,price,area,bedrooms,bathrooms,builder,featured
"2 BHK Flat in Kharadi","Spacious 2BHK apartment with modern amenities","Pune - East Zone",Flat,Ready,5500000,1450,2,2,"Kolte Patil",false
"Commercial Shop in Viman Nagar","Prime location shop space","Pune - East Zone",Shop,Ready,8500000,800,,,"Kumar Properties",false
"Residential Land in Baner","Plot for villa construction","Pune - West Zone",Land,Ready,15000000,3000,,,"Goel Ganga",false`;

    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "property_import_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const errors: string[] = [];
        const parsed: ParsedProperty[] = [];

        results.data.forEach((row: any, index: number) => {
          try {
            // Validate required fields
            if (!row.title || !row.description || !row.location || !row.propertyType || !row.status || !row.price) {
              errors.push(`Row ${index + 1}: Missing required fields`);
              return;
            }

            // Validate enums
            const validTypes = ["Flat", "Land", "Office", "Shop", "Rental"];
            const validStatuses = ["Ready", "Under-Construction"];
            
            if (!validTypes.includes(row.propertyType)) {
              errors.push(`Row ${index + 1}: Invalid propertyType "${row.propertyType}". Must be one of: ${validTypes.join(", ")}`);
              return;
            }

            if (!validStatuses.includes(row.status)) {
              errors.push(`Row ${index + 1}: Invalid status "${row.status}". Must be one of: ${validStatuses.join(", ")}`);
              return;
            }

            // Parse numbers
            const price = parseFloat(row.price);
            const area = row.area ? parseFloat(row.area) : undefined;
            const bedrooms = row.bedrooms ? parseInt(row.bedrooms) : undefined;
            const bathrooms = row.bathrooms ? parseInt(row.bathrooms) : undefined;

            if (isNaN(price)) {
              errors.push(`Row ${index + 1}: Invalid price "${row.price}"`);
              return;
            }

            parsed.push({
              title: row.title,
              description: row.description,
              location: row.location,
              propertyType: row.propertyType,
              status: row.status,
              price,
              area: area || 0,
              bedrooms,
              bathrooms,
              builder: row.builder && row.builder.trim() ? row.builder : undefined,
              featured: row.featured === "true" || row.featured === true,
            });
          } catch (error) {
            errors.push(`Row ${index + 1}: ${error instanceof Error ? error.message : "Unknown error"}`);
          }
        });

        setParsedData(parsed);
        setParseErrors(errors);
        setImportResult(null);
      },
      error: (error) => {
        setParseErrors([`CSV parsing error: ${error.message}`]);
      },
    });
  };

  const handleImport = async () => {
    if (parsedData.length === 0) return;

    setIsImporting(true);
    try {
      const result = await bulkImportMutation.mutateAsync({
        properties: parsedData,
      });
      setImportResult(result);
      if (result.success > 0) {
        setParsedData([]);
      }
    } catch (error) {
      setParseErrors([error instanceof Error ? error.message : "Import failed"]);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Bulk Property Import</h1>
        <p className="text-muted-foreground mt-2">
          Upload a CSV file to import multiple properties at once
        </p>
      </div>

      {/* Template Download */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Download CSV Template
          </CardTitle>
          <CardDescription>
            Start with our template to ensure proper formatting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={downloadTemplate} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download Template
          </Button>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload CSV File
          </CardTitle>
          <CardDescription>
            Select a CSV file containing property data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="cursor-pointer">
              <Button variant="outline" type="button">
                Choose CSV File
              </Button>
            </label>
            <p className="text-sm text-muted-foreground mt-2">
              Supports .csv files with property data (images can be added later via edit)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Parse Errors */}
      {parseErrors.length > 0 && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold mb-2">Validation Errors:</div>
            <ul className="list-disc list-inside space-y-1">
              {parseErrors.map((error, index) => (
                <li key={index} className="text-sm">{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Preview Table */}
      {parsedData.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Preview ({parsedData.length} properties)</CardTitle>
            <CardDescription>
              Review the parsed data before importing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Title</th>
                    <th className="text-left p-2">Location</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Price</th>
                    <th className="text-left p-2">Area</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.slice(0, 10).map((property, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{property.title}</td>
                      <td className="p-2">{property.location}</td>
                      <td className="p-2">{property.propertyType}</td>
                      <td className="p-2">₹{(property.price / 100000).toFixed(1)}L</td>
                      <td className="p-2">{property.area} sq.ft</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsedData.length > 10 && (
                <p className="text-sm text-muted-foreground mt-2">
                  ... and {parsedData.length - 10} more properties
                </p>
              )}
            </div>
            <div className="mt-4">
              <Button
                onClick={handleImport}
                disabled={isImporting || parseErrors.length > 0}
                className="w-full"
              >
                {isImporting ? "Importing..." : `Import ${parsedData.length} Properties`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Result */}
      {importResult && (
        <Alert variant={importResult.failed === 0 ? "default" : "destructive"}>
          {importResult.failed === 0 ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>
            <div className="font-semibold mb-2">Import Complete</div>
            <p>Successfully imported: {importResult.success} properties</p>
            {importResult.failed > 0 && (
              <>
                <p className="text-red-600">Failed: {importResult.failed} properties</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {importResult.errors.map((error, index) => (
                    <li key={index} className="text-sm">
                      Row {error.row}: {error.error}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
