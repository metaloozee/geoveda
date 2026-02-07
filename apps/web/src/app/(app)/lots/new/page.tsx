"use client";

import { api } from "@geoveda/backend/convex/_generated/api";
import { Authenticated, useMutation } from "convex/react";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CreateLotPage() {
  const router = useRouter();
  const createLot = useMutation((api as any).lots?.create);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    productName: "",
    origin: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { lotId, lotNumber } = await createLot({
        productName: formData.productName,
        origin: formData.origin,
      });

      toast.success(`Lot ${lotNumber} created successfully`);
      router.push(("/lots/" + lotId) as any);
    } catch (error) {
      console.error("Failed to create lot:", error);
      toast.error("Failed to create lot. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl space-y-8 py-8">
      <Authenticated>
        <div>
          <Link
            className="mb-4 inline-flex items-center text-muted-foreground text-sm hover:text-foreground"
            href="/lots"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Lots
          </Link>
          <h1 className="font-bold text-3xl tracking-tight">Create New Lot</h1>
          <p className="mt-2 text-muted-foreground">
            Register a new product batch to start tracking its journey.
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Lot Details</CardTitle>
              <CardDescription>
                Enter the initial information for this product lot.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="productName">Product Name</Label>
                <Input
                  data-testid="product-name"
                  id="productName"
                  name="productName"
                  onChange={handleChange}
                  placeholder="e.g. Arabica Coffee Beans - Harvest 2023"
                  required
                  value={formData.productName}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="origin">Origin / Location</Label>
                <Input
                  data-testid="product-origin"
                  id="origin"
                  name="origin"
                  onChange={handleChange}
                  placeholder="e.g. Finca La Hermosa, Colombia"
                  required
                  value={formData.origin}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Link href="/lots">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button
                data-testid="create-lot"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Lot"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </Authenticated>
    </div>
  );
}
