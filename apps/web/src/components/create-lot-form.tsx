"use client";

import { useConvexMutation } from "@convex-dev/react-query";
import { api } from "@geoveda/backend/convex/_generated/api";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { Authenticated } from "convex/react";
import { ArrowLeft, Loader2, MapPin, Package } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { Separator } from "./ui/separator";

function CreateLotFormInner() {
  const router = useRouter();
  const createLotMutationFn = useConvexMutation(api.lots.create);
  const { mutateAsync: createLot, isPending } = useMutation({
    mutationFn: createLotMutationFn,
  });

  const form = useForm({
    defaultValues: {
      productName: "",
      origin: "",
    },
    onSubmit: async ({ value }) => {
      try {
        const { lotId, lotNumber } = await createLot({
          productName: value.productName,
          origin: value.origin,
        });
        toast.success(`Lot ${lotNumber} created successfully`);
        router.push(`/lots/${lotId}` as never);
      } catch {
        toast.error("Failed to create lot. Please try again.");
      }
    },
  });

  return (
    <div className="space-y-6 p-6">
      <div>
        <Button
          asChild
          className="mb-4 text-muted-foreground"
          size="sm"
          variant="ghost"
        >
          <Link href={"/lots" as never}>
            <ArrowLeft className="h-4 w-4" />
            Back to Lots
          </Link>
        </Button>
        <h1 className="font-semibold text-2xl tracking-tight">
          Create New Lot
        </h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Register a new product batch to start tracking its journey.
        </p>
      </div>

      <div className="w-full">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Lot Details</CardTitle>
              <CardDescription>
                Enter the initial information for this product lot.
              </CardDescription>
            </CardHeader>
            <Separator className="my-2" />
            <CardContent className="space-y-4">
              <form.Field
                name="productName"
                validators={{
                  onChange: ({ value }) =>
                    value ? undefined : "Product name is required",
                }}
              >
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Product Name</Label>
                    <div className="relative">
                      <Package className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        aria-invalid={field.state.meta.errors.length > 0}
                        className="pl-9"
                        data-testid="product-name"
                        id={field.name}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="e.g. Arabica Coffee Beans - Harvest 2023"
                        value={field.state.value}
                      />
                    </div>
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-destructive text-sm">
                        {field.state.meta.errors[0]}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>

              <form.Field
                name="origin"
                validators={{
                  onChange: ({ value }) =>
                    value ? undefined : "Origin is required",
                }}
              >
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Origin / Location</Label>
                    <div className="relative">
                      <MapPin className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        aria-invalid={field.state.meta.errors.length > 0}
                        className="pl-9"
                        data-testid="product-origin"
                        id={field.name}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="e.g. Finca La Hermosa, Colombia"
                        value={field.state.value}
                      />
                    </div>
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-destructive text-sm">
                        {field.state.meta.errors[0]}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>
            </CardContent>
            <Separator className="my-2" />

            <CardFooter className="items-center justify-end">
              <div className="flex justify-end gap-2">
                <Button asChild size={"lg"} type="button" variant="outline">
                  <Link href={"/lots" as never}>Cancel</Link>
                </Button>
                <Button
                  data-testid="create-lot"
                  disabled={isPending}
                  size={"lg"}
                  type="submit"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating…
                    </>
                  ) : (
                    "Create Lot"
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
}

export function CreateLotForm() {
  return (
    <Authenticated>
      <CreateLotFormInner />
    </Authenticated>
  );
}
