"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/utils";
import { Button } from "@/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/ui/popover";

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

interface CustomerSelectorProps {
  value: string | null;
  onChange: (customerId: string | null) => void;
  customers: Customer[];
  placeholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
}

export function CustomerSelector({
  value,
  onChange,
  customers,
  placeholder = "Chọn khách hàng...",
  emptyMessage = "Không tìm thấy khách hàng",
  disabled = false,
}: CustomerSelectorProps) {
  const [open, setOpen] = React.useState(false);

  const selectedCustomer = React.useMemo(
    () => customers.find((c) => c.id === value),
    [customers, value]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedCustomer ? (
            <span className="flex items-center gap-2">
              <span className="font-medium">{selectedCustomer.name}</span>
              {selectedCustomer.phone && (
                <span className="text-muted-foreground text-sm">
                  • {selectedCustomer.phone}
                </span>
              )}
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Tìm theo tên hoặc số điện thoại..." />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {customers.map((customer) => (
                <CommandItem
                  key={customer.id}
                  value={`${customer.name} ${customer.phone || ""}`}
                  onSelect={() => {
                    onChange(customer.id === value ? null : customer.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === customer.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{customer.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {customer.phone && `SĐT: ${customer.phone}`}
                      {customer.phone && customer.email && " • "}
                      {customer.email && `Email: ${customer.email}`}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
