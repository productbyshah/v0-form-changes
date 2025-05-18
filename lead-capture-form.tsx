"use client"

import type React from "react"

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { MapPin, Phone, Scale, Send, Upload, User, FileCheck, Plus, X } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2 } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]

const formSchema = z.object({
  products: z
    .array(
      z.object({
        productType: z.string({
          required_error: "Please select a product category",
        }),
        otherProductType: z.string().optional(),
        standard: z.string().min(1, {
          message: "Standard is required",
        }),
        grade: z.string().min(1, {
          message: "Grade is required",
        }),
        shape: z.string().min(1, {
          message: "Shape is required",
        }),
        quantity: z.coerce
          .number({
            required_error: "Quantity is required",
            invalid_type_error: "Quantity must be a number",
          })
          .positive({
            message: "Quantity must be positive",
          }),
        thickness: z.string().min(1, {
          message: "Thickness is required",
        }),
        width: z.string().min(1, {
          message: "Width is required",
        }),
        length: z.string().min(1, {
          message: "Length is required",
        }),
        hardness: z.string().optional(),
        coatingGrade: z.string().optional(),
        temper: z.string().optional(),
      }),
    )
    .min(1, "At least one product is required")
    .max(5, "Maximum 5 products allowed"),
  destinationLocation: z.string().min(3, {
    message: "Destination location is required",
  }),
  expectedDeliveryDate: z.string().min(1, {
    message: "Expected delivery date is required",
  }),
  contactName: z.string().min(2, {
    message: "Contact name is required",
  }),
  phone: z.string().min(10, {
    message: "Please enter a valid phone number",
  }),
  gstin: z.string().optional(),
  additionalInfo: z
    .string()
    .max(500, {
      message: "Additional information cannot exceed 500 words",
    })
    .optional(),
  file: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, "File is required")
    .refine((files) => files[0]?.size <= MAX_FILE_SIZE, "Max file size is 5MB")
    .refine(
      (files) => ACCEPTED_FILE_TYPES.includes(files[0]?.type),
      "Only PDF, JPEG, PNG, and DOC/DOCX files are accepted",
    )
    .optional(),
})

type FormValues = z.infer<typeof formSchema>

export function LeadCaptureForm() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [showOtherProductType, setShowOtherProductType] = useState<boolean[]>([false])
  const isMobile = useMediaQuery("(max-width: 640px)")

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      products: [
        {
          productType: "",
          otherProductType: "",
          standard: "",
          grade: "",
          shape: "",
          quantity: undefined,
          thickness: "",
          width: "",
          length: "",
          hardness: "",
          coatingGrade: "",
          temper: "",
        },
      ],
      additionalInfo: "",
      gstin: "",
      expectedDeliveryDate: "",
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "products",
  })

  function onSubmit(data: FormValues) {
    console.log(data)
    // In a real application, you would send this data to your backend
    setIsSubmitted(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name)
      form.setValue("file", e.target.files as FileList)
    }
  }

  const handleProductTypeChange = (value: string, index: number) => {
    const newShowOtherProductType = [...showOtherProductType]
    newShowOtherProductType[index] = value === "OTHER"
    setShowOtherProductType(newShowOtherProductType)
    form.setValue(`products.${index}.productType`, value)
  }

  const addProduct = () => {
    if (fields.length < 5) {
      append({
        productType: "",
        otherProductType: "",
        standard: "",
        grade: "",
        shape: "",
        quantity: undefined,
        thickness: "",
        width: "",
        length: "",
        hardness: "",
        coatingGrade: "",
        temper: "",
      })
      setShowOtherProductType([...showOtherProductType, false])
    }
  }

  const removeProduct = (index: number) => {
    if (fields.length > 1) {
      remove(index)
      const newShowOtherProductType = [...showOtherProductType]
      newShowOtherProductType.splice(index, 1)
      setShowOtherProductType(newShowOtherProductType)
    }
  }

  if (isSubmitted) {
    return (
      <Card className="w-full mx-auto max-w-[95%] sm:max-w-3xl">
        <div className="flex justify-center py-4">
          <Image src="/images/steelbazaar-logo.png" alt="STEELBAZAAR" width={80} height={80} className="mb-2" />
        </div>
        <CardContent className="pt-2">
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <AlertTitle className="text-green-800 text-lg font-medium">Lead Successfully Captured!</AlertTitle>
            <AlertDescription className="text-green-700">
              Thank you for submitting your requirements. Our team will review your information and contact you shortly.
            </AlertDescription>
          </Alert>
          <div className="flex justify-center mt-6">
            <Button
              onClick={() => {
                setIsSubmitted(false)
                form.reset()
                setFileName(null)
              }}
              className="mt-4 h-12"
            >
              Submit Another Requirement
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full mx-auto max-w-[95%] sm:max-w-3xl">
      <div className="flex flex-col items-center pt-6 pb-2">
        <Image src="/images/steelbazaar-logo.png" alt="STEELBAZAAR" width={100} height={100} className="mb-2" />
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 tracking-wide">STEELBAZAAR</h1>
      </div>
      <CardHeader className="p-4 sm:p-6 pt-2">
        <CardTitle className="text-xl sm:text-2xl text-center">Your Requirements</CardTitle>
        <CardDescription className="text-sm sm:text-base text-center">
          Please provide details about your steel requirements
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            {/* Contact Information at the top */}
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">Contact Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input placeholder="Enter your full name" className="pl-10 h-12" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">Phone Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input placeholder="Enter your phone number" className="pl-10 h-12" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="gstin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">GSTIN (optional)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <FileCheck className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input placeholder="Enter your GSTIN number" className="pl-10 h-12" {...field} />
                    </div>
                  </FormControl>
                  <FormDescription className="text-xs sm:text-sm">
                    Goods and Services Tax Identification Number
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Products Section */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-base sm:text-lg font-medium">Products</h3>
                {fields.length < 5 && (
                  <Button type="button" variant="outline" size="sm" className="h-10" onClick={addProduct}>
                    <Plus className="h-4 w-4 mr-1" /> Add Product
                  </Button>
                )}
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="border rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-sm sm:text-base">Product {index + 1}</h4>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeProduct(index)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name={`products.${index}.productType`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm sm:text-base">Product Category</FormLabel>
                        <Select
                          onValueChange={(value) => handleProductTypeChange(value, index)}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Select product category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="HOT_ROLLED">HOT ROLLED</SelectItem>
                            <SelectItem value="COLD_ROLLED">COLD ROLLED</SelectItem>
                            <SelectItem value="GALVANIZED">GALVANIZED</SelectItem>
                            <SelectItem value="TINFREE">TINFREE</SelectItem>
                            <SelectItem value="TINPLATE">TINPLATE</SelectItem>
                            <SelectItem value="OTHER">OTHER</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch(`products.${index}.productType`) && (
                    <>
                      {showOtherProductType[index] && (
                        <FormField
                          control={form.control}
                          name={`products.${index}.otherProductType`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm sm:text-base">Specify Product Category</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter product category" className="h-12" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {/* Common prerequisite fields for all product types */}
                      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name={`products.${index}.standard`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm sm:text-base">Standard</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter standard" className="h-12" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`products.${index}.grade`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm sm:text-base">Grade</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter grade" className="h-12" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name={`products.${index}.shape`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm sm:text-base">Shape</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter shape" className="h-12" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`products.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm sm:text-base">Required Quantity (MT)</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Scale className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                  <Input placeholder="Enter quantity" type="number" className="pl-10 h-12" {...field} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Product-specific fields */}
                      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name={`products.${index}.thickness`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm sm:text-base">Thickness (MM)</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter thickness" className="h-12" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`products.${index}.width`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm sm:text-base">Width (MM)</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter width" className="h-12" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name={`products.${index}.length`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm sm:text-base">Length (MM)</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter length" className="h-12" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {(form.watch(`products.${index}.productType`) === "HOT_ROLLED" ||
                          form.watch(`products.${index}.productType`) === "COLD_ROLLED" ||
                          form.watch(`products.${index}.productType`) === "GALVANIZED") && (
                          <FormField
                            control={form.control}
                            name={`products.${index}.hardness`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm sm:text-base">Hardness</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter hardness" className="h-12" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        {(form.watch(`products.${index}.productType`) === "GALVANIZED" ||
                          form.watch(`products.${index}.productType`) === "TINFREE" ||
                          form.watch(`products.${index}.productType`) === "TINPLATE") && (
                          <FormField
                            control={form.control}
                            name={`products.${index}.coatingGrade`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm sm:text-base">Coating Grade</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter coating grade" className="h-12" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        {(form.watch(`products.${index}.productType`) === "TINFREE" ||
                          form.watch(`products.${index}.productType`) === "TINPLATE") && (
                          <FormField
                            control={form.control}
                            name={`products.${index}.temper`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm sm:text-base">Temper</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter temper" className="h-12" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="destinationLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">Destination Location</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input placeholder="Enter city, state, country" className="pl-10 h-12" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expectedDeliveryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">Expected Delivery Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        className="h-12"
                        {...field}
                        onChange={(e) => {
                          // Format date as DD-MM-YYYY
                          const date = new Date(e.target.value)
                          if (!isNaN(date.getTime())) {
                            const formattedDate = `${date.getDate().toString().padStart(2, "0")}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getFullYear()}`
                            field.onChange(formattedDate)
                          } else {
                            field.onChange(e.target.value)
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="file"
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">Upload Product Information</FormLabel>
                  <FormControl>
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 sm:p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                      <input
                        type="file"
                        id="file-upload"
                        className="sr-only"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        {...fieldProps}
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
                        <div className="mt-2 text-sm font-medium text-gray-900">
                          {fileName ? fileName : "Click to upload or drag and drop"}
                        </div>
                        <p className="mt-1 text-xs text-gray-500">PDF, DOC, DOCX, JPG, JPEG or PNG (max. 5MB)</p>
                      </label>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="additionalInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">Additional Information</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any other details you'd like to share (max 500 words)"
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs sm:text-sm">
                    {field.value ? field.value.split(/\s+/).filter(Boolean).length : 0}/500 words
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full h-12 text-base bg-blue-700 hover:bg-blue-800">
              <Send className="mr-2 h-4 w-4" /> Submit Requirements
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col text-center text-xs sm:text-sm text-gray-500 p-4 sm:p-6">
        <p>By submitting this form, you agree to SteelBazaar's terms of service and privacy policy.</p>
      </CardFooter>
    </Card>
  )
}
