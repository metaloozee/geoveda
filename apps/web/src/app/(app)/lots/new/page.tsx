"use client";

import { api } from "@geoveda/backend/convex/_generated/api";
import { Authenticated, useMutation } from "convex/react";
import { ArrowLeft, Loader2, MapPin, Package } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

function CreateLotContent() {
  const router = useRouter();
  const createLot = useMutation(api.lots.create);

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
      router.push(`/lots/${lotId}` as never);
    } catch {
      toast.error("Failed to create lot. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <Button
          className="mb-4 text-muted-foreground"
          render={<Link href={"/lots" as never} />}
          size="sm"
          variant="ghost"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to Lots
        </Button>
        <h1 className="font-semibold text-2xl tracking-tight">
          Create New Lot
        </h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Register a new product batch to start tracking its journey.
        </p>
      </div>

      <div className="mx-auto max-w-xl">
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle className="text-base">Lot Details</CardTitle>
              <CardDescription>
                Enter the initial information for this product lot.
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="productName">Product Name</Label>
                <div className="relative">
                  <Package className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    data-testid="product-name"
                    id="productName"
                    name="productName"
                    onChange={handleChange}
                    placeholder="e.g. Arabica Coffee Beans - Harvest 2023"
                    required
                    value={formData.productName}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="origin">Origin / Location</Label>
                <div className="relative">
                  <MapPin className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    data-testid="product-origin"
                    id="origin"
                    name="origin"
                    onChange={handleChange}
                    placeholder="e.g. Finca La Hermosa, Colombia"
                    required
                    value={formData.origin}
                  />
                </div>
              </div>
            </CardContent>
            <Separator />
            <div className="flex justify-end gap-2 p-6">
              <Button
                render={<Link href={"/lots" as never} />}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                data-testid="create-lot"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating…
                  </>
                ) : (
                  "Create Lot"
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default function CreateLotPage() {
  return (
    <Authenticated>
      <CreateLotContent />
    </Authenticated>
  );
}
