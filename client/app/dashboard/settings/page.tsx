"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
} from "@/components/ui/input-group"
import { updateBudget, getBudget } from "@/lib/actions/users.action"
import { redirect } from "next/navigation";
import ManageStatements from "@/components/ManageStatements";

const formSchema = z.object({
  daily: z
    .string()
    .min(1, "Daily budget is required.")
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Must be a positive number."),
  weekly: z
    .string()
    .min(1, "Weekly budget is required.")
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Must be a positive number."),
  monthly: z
    .string()
    .min(1, "Monthly budget is required.")
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Must be a positive number."),
  yearly: z
    .string()
    .min(1, "Yearly budget is required.")
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Must be a positive number."),
})

export default function SettingsPage() {
  const [loading, setLoading] = React.useState(true)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      daily: "",
      weekly: "",
      monthly: "",
      yearly: "",
    },
  })

  React.useEffect(() => {
    getBudget().then((budget) => {
      if (budget) {
        form.reset({
          daily: String(budget.daily),
          weekly: String(budget.weekly),
          monthly: String(budget.monthly),
          yearly: String(budget.yearly),
        })
      }
      setLoading(false)
    })
  }, [form])

  async function onSubmit(data: z.infer<typeof formSchema>) {
    const result = await updateBudget(data.monthly, data.weekly, data.daily, data.yearly)
    if (result.error) {
      toast("Failed to save budgets", {
        description: result.error,
      })
      return
    }
    toast("Budgets saved successfully!", {
      description: (
        <pre className="mt-2 w-[320px] overflow-x-auto rounded-md bg-code p-4 text-code-foreground">
          <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
      position: "bottom-right",
      classNames: {
        content: "flex flex-col gap-2",
      },
      style: {
        "--border-radius": "calc(var(--radius)  + 4px)",
      } as React.CSSProperties,
    })
  }

  return (
    <div className="flex justify-center items-center min-h-[calc(100dvh-8rem)]">
        <div className="w-full max-w-md mx-auto flex flex-col items-center px-0">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground text-sm md:text-base mb-8 text-center">
            Set your daily, weekly, monthly &amp; yearly budget limits and manage your statements data
          </p>
          <div className="flex flex-col gap-8 w-full">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Budget Limits</CardTitle>
              <CardDescription>
                Define your spending caps to track expenses against.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground">Loading budgets...</p>
              ) : (
                <form id="budget-form" onSubmit={form.handleSubmit(onSubmit)}>
                  <FieldGroup>
                    <Controller
                      name="daily"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="budget-daily">
                            Set Daily Budget (₹)
                          </FieldLabel>
                          <InputGroup>
                            <InputGroupAddon align="inline-start">
                              <InputGroupText>₹</InputGroupText>
                            </InputGroupAddon>
                            <Input
                              {...field}
                              id="budget-daily"
                              type="number"
                              placeholder="e.g. 2000"
                              aria-invalid={fieldState.invalid}
                            />
                          </InputGroup>
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                          <FieldDescription>
                            Total spending limit per day.
                          </FieldDescription>
                        </Field>
                      )}
                    />
                    <Controller
                      name="weekly"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="budget-weekly">
                            Set Weekly Budget (₹)
                          </FieldLabel>
                          <InputGroup>
                            <InputGroupAddon align="inline-start">
                              <InputGroupText>₹</InputGroupText>
                            </InputGroupAddon>
                            <Input
                              {...field}
                              id="budget-weekly"
                              type="number"
                              placeholder="e.g. 12000"
                              aria-invalid={fieldState.invalid}
                            />
                          </InputGroup>
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                          <FieldDescription>
                            Total spending limit per week.
                          </FieldDescription>
                        </Field>
                      )}
                    />
                    <Controller
                      name="monthly"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="budget-monthly">
                            Set Monthly Budget (₹)
                          </FieldLabel>
                          <InputGroup>
                            <InputGroupAddon align="inline-start">
                              <InputGroupText>₹</InputGroupText>
                            </InputGroupAddon>
                            <Input
                              {...field}
                              id="budget-monthly"
                              type="number"
                              placeholder="e.g. 50000"
                              aria-invalid={fieldState.invalid}
                            />
                          </InputGroup>
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                          <FieldDescription>
                            Total spending limit per month.
                          </FieldDescription>
                        </Field>
                      )}
                    />
                    <Controller
                      name="yearly"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="budget-yearly">
                            Set Yearly Budget (₹)
                          </FieldLabel>
                          <InputGroup>
                            <InputGroupAddon align="inline-start">
                              <InputGroupText>₹</InputGroupText>
                            </InputGroupAddon>
                            <Input
                              {...field}
                              id="budget-yearly"
                              type="number"
                              placeholder="e.g. 600000"
                              aria-invalid={fieldState.invalid}
                            />
                          </InputGroup>
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                          <FieldDescription>
                            Total spending limit per year.
                          </FieldDescription>
                        </Field>
                      )}
                    />
                  </FieldGroup>
                </form>
              )}
            </CardContent>
            {!loading && (
              <CardFooter>
                <Field orientation="horizontal" className="flex-col sm:flex-row gap-2 sm:gap-0">
                  <Button type="button" variant="outline" onClick={() => {
                    form.reset({ daily: "", weekly: "", monthly: "", yearly: "" })
                  }}>
                    Reset
                  </Button>
                  <Button onClick={()=>(redirect("/dashboard"))} type="submit" form="budget-form">
                    Save Budget
                  </Button>
                </Field>
              </CardFooter>
            )}
          </Card>
          <ManageStatements />
          </div>
        </div>
    </div>
  )
}
