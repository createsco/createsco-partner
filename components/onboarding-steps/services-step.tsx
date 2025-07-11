"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Edit3, Trash2 } from "lucide-react"
import { useOnboarding } from "@/contexts/onboarding-context"

interface Service {
  name: string
  description: string
  basePrice: number
  priceUnit: string
  isActive?: boolean
}

export function ServicesStep() {
  const { partnerData, addService, goToStep } = useOnboarding()
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)

  const [serviceForm, setServiceForm] = useState<Service>({
    name: "",
    description: "",
    basePrice: 0,
    priceUnit: "per_project",
    isActive: true,
  })

  const services = partnerData.services || []

  const handleInputChange = (field: string, value: any) => {
    setServiceForm((prev) => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setServiceForm({
      name: "",
      description: "",
      basePrice: 0,
      priceUnit: "per_project",
      isActive: true,
    })
    setEditingService(null)
  }

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await addService(serviceForm)
      setDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error adding service:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleContinue = () => {
    goToStep(3)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Services & Pricing</CardTitle>
        <p className="text-gray-600">Add the photography services you offer</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Existing Services */}
        {services.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Your Services</h3>
            <div className="grid gap-4">
              {services.map((service: any, index: number) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{service.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <Badge variant="secondary">
                          ₹{service.basePrice.toLocaleString()} {service.priceUnit.replace("_", " ")}
                        </Badge>
                        <Badge variant={service.isActive ? "default" : "secondary"}>
                          {service.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Add Service Button */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Photography Service</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddService} className="space-y-4">
              <div>
                <Label htmlFor="serviceName">Service Name *</Label>
                <Input
                  id="serviceName"
                  placeholder="e.g., Wedding Photography"
                  value={serviceForm.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="serviceDescription">Description</Label>
                <Textarea
                  id="serviceDescription"
                  placeholder="Describe what's included in this service..."
                  value={serviceForm.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="basePrice">Base Price (₹) *</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    placeholder="25000"
                    value={serviceForm.basePrice || ""}
                    onChange={(e) => handleInputChange("basePrice", Number.parseInt(e.target.value) || 0)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="priceUnit">Price Unit *</Label>
                  <Select
                    value={serviceForm.priceUnit}
                    onValueChange={(value) => handleInputChange("priceUnit", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="per_hour">Per Hour</SelectItem>
                      <SelectItem value="per_day">Per Day</SelectItem>
                      <SelectItem value="per_project">Per Project</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={serviceForm.isActive ?? true}
                  onChange={(e) => handleInputChange("isActive", e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isActive">Service is active and available for booking</Label>
              </div>

              <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Service"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={() => goToStep(1)}>
            Back
          </Button>
          <Button onClick={handleContinue} disabled={services.length === 0}>
            Continue to Locations
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
