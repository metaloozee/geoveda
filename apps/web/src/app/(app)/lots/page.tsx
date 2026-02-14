"use client";

import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { api } from "@geoveda/backend/convex/_generated/api";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Authenticated } from "convex/react";
import { Loader2, MapPin, Package, PlusIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { LotsDataTable } from "@/components/lots-data-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { canCreateLot } from "@/lib/workflow";

function LotsContentInner() {
  const router = useRouter();
  const { data: user } = useQuery(convexQuery(api.users.getCurrent, {}));
  const { data: lots, isPending } = useQuery(convexQuery(api.lots.list, {}));
  const searchParams = useSearchParams();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const showCreateLot = user?.role ? canCreateLot(user.role) : false;

  useEffect(() => {
    if (showCreateLot && searchParams.get("create") === "1") {
      setIsCreateDialogOpen(true);
    }
  }, [showCreateLot, searchParams]);
  const createLotMutationFn = useConvexMutation(api.lots.create);
  const { mutateAsync: createLot, isPending: isCreatingLot } = useMutation({
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
        setIsCreateDialogOpen(false);
        router.push(`/lots/${lotId}` as never);
      } catch {
        toast.error("Failed to create lot. Please try again.");
      }
    },
  });

  const lotCountLabel = useMemo(() => {
    const lotCount = lots?.length ?? 0;
    return `${lotCount} lot${lotCount === 1 ? "" : "s"}`;
  }, [lots]);

  return (
    <div className="space-y-5 p-4 sm:space-y-6 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="font-semibold text-2xl tracking-tight">All Lots</h1>
          <p className="text-muted-foreground text-sm">
            Track and manage product lots across the supply chain.{" "}
            {lotCountLabel}
          </p>
        </div>
        {showCreateLot && (
          <Dialog
            onOpenChange={setIsCreateDialogOpen}
            open={isCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <PlusIcon className="h-4 w-4" />
                New Lot
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Lot</DialogTitle>
                <DialogDescription>
                  Register a new product batch to start tracking its journey.
                </DialogDescription>
              </DialogHeader>
              <form
                className="space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  form.handleSubmit();
                }}
              >
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
                          onChange={(event) =>
                            field.handleChange(event.target.value)
                          }
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
                          onChange={(event) =>
                            field.handleChange(event.target.value)
                          }
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
                <div className="flex items-center justify-end gap-2 pt-2">
                  <DialogClose asChild>
                    <Button
                      disabled={isCreatingLot}
                      type="button"
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    data-testid="create-lot"
                    disabled={isCreatingLot}
                    type="submit"
                  >
                    {isCreatingLot ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating…
                      </>
                    ) : (
                      "Create Lot"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <LotsDataTable
        canCreateLot={showCreateLot}
        isPending={isPending}
        lots={lots}
        onCreateLot={
          showCreateLot ? () => setIsCreateDialogOpen(true) : undefined
        }
      />
    </div>
  );
}

export default function LotsPage() {
  return (
    <Authenticated>
      <LotsContentInner />
    </Authenticated>
  );
}
