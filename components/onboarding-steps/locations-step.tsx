"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, X, MapPin, Navigation, CheckCircle } from "lucide-react"
import { useOnboarding } from "@/contexts/onboarding-context"

export function LocationsStep() {
  const { partnerData, updateLocations, goToStep } = useOnboarding()
  const [loading, setLoading] = useState(false)
  const [gettingLocation, setGettingLocation] = useState(false)

  const [formData, setFormData] = useState({
    partnerLocations: partnerData.partnerLocations || [],
    servingLocations: partnerData.servingLocations || [],
    locationPricing: partnerData.locationPricing || {},
  })

  const [newLocation, setNewLocation] = useState({
    city: "",
    state: "",
    pinCodes: "",
    coordinates: null as { lat: number; lng: number } | null,
  })

  const [newServingLocation, setNewServingLocation] = useState("")
  const [newLocationPrice, setNewLocationPrice] = useState("")

  const indianStates = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Delhi",
    "Jammu and Kashmir",
    "Ladakh",
    "Puducherry",
  ]

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.")
      return
    }

    setGettingLocation(true)

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        })
      })

      const { latitude, longitude } = position.coords

      // Set coordinates
      setNewLocation((prev) => ({
        ...prev,
        coordinates: { lat: latitude, lng: longitude },
      }))

      // Try to reverse geocode to get city and state
      try {
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
        )

        if (response.ok) {
          const data = await response.json()

          // Extract city and state from the response
          const city = data.city || data.locality || data.principalSubdivision || ""
          const state = data.principalSubdivision || ""

          if (city) {
            setNewLocation((prev) => ({
              ...prev,
              city: city,
              state: indianStates.find((s) => s.toLowerCase().includes(state.toLowerCase())) || prev.state,
            }))
          }
        }
      } catch (geocodeError) {
        console.log("Reverse geocoding failed, but coordinates were captured:", geocodeError)
      }
    } catch (error: any) {
      console.error("Error getting location:", error)

      let errorMessage = "Unable to get your location. "

      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage += "Please allow location access and try again."
          break
        case error.POSITION_UNAVAILABLE:
          errorMessage += "Location information is unavailable."
          break
        case error.TIMEOUT:
          errorMessage += "Location request timed out."
          break
        default:
          errorMessage += "Please enter your location manually."
          break
      }

      alert(errorMessage)
    } finally {
      setGettingLocation(false)
    }
  }

  const handleAddPartnerLocation = () => {
    if (newLocation.city && newLocation.state) {
      const pinCodesArray = newLocation.pinCodes
        .split(",")
        .map((pin) => pin.trim())
        .filter((pin) => pin)

      const location = {
        city: newLocation.city,
        state: newLocation.state,
        coordinates: newLocation.coordinates || { lat: 0, lng: 0 },
        pinCodesServed: pinCodesArray,
      }

      setFormData((prev) => ({
        ...prev,
        partnerLocations: [...prev.partnerLocations, location],
      }))

      setNewLocation({ city: "", state: "", pinCodes: "", coordinates: null })
    }
  }

  const handleRemovePartnerLocation = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      partnerLocations: prev.partnerLocations.filter((_, i) => i !== index),
    }))
  }

  const handleAddServingLocation = () => {
    if (newServingLocation && newLocationPrice) {
      setFormData((prev) => ({
        ...prev,
        servingLocations: [...prev.servingLocations, newServingLocation],
        locationPricing: {
          ...prev.locationPricing,
          [newServingLocation]: Number.parseInt(newLocationPrice),
        },
      }))

      setNewServingLocation("")
      setNewLocationPrice("")
    }
  }

  const handleRemoveServingLocation = (location: string) => {
    setFormData((prev) => {
      const newLocationPricing = { ...prev.locationPricing }
      delete newLocationPricing[location]

      return {
        ...prev,
        servingLocations: prev.servingLocations.filter((loc) => loc !== location),
        locationPricing: newLocationPricing,
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await updateLocations(formData)
    } catch (error) {
      console.error("Error updating locations:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Location & Service Areas</CardTitle>
        <p className="text-gray-600">Tell us where you're based and where you provide services</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Partner Locations */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Your Business Locations</Label>
              <p className="text-sm text-gray-600">Where is your studio/office located?</p>
            </div>

            {formData.partnerLocations.length > 0 && (
              <div className="space-y-2">
                {formData.partnerLocations.map((location: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>
                        {location.city}, {location.state}
                      </span>
                      {location.pinCodesServed.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {location.pinCodesServed.length} PIN codes
                        </Badge>
                      )}
                      {location.coordinates && location.coordinates.lat !== 0 && location.coordinates.lng !== 0 && (
                        <Badge variant="secondary" className="text-xs">
                          <Navigation className="h-3 w-3 mr-1" />
                          GPS
                        </Badge>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemovePartnerLocation(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-4">
              {/* Current Location Button */}
              <div className="flex items-center justify-between p-4 border-2 border-dashed border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Navigation className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">Use Current Location</p>
                    <p className="text-sm text-gray-600">Get your exact coordinates automatically</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={getCurrentLocation}
                  disabled={gettingLocation}
                  className="flex items-center space-x-2"
                >
                  {gettingLocation ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Getting Location...</span>
                    </>
                  ) : (
                    <>
                      <Navigation className="h-4 w-4" />
                      <span>Get Location</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Location Form */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <div className="relative">
                    <Input
                      id="city"
                      placeholder="Mumbai"
                      value={newLocation.city}
                      onChange={(e) => setNewLocation((prev) => ({ ...prev, city: e.target.value }))}
                    />
                    {newLocation.coordinates && (
                      <CheckCircle className="absolute right-2 top-2.5 h-4 w-4 text-green-500" />
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Select
                    value={newLocation.state}
                    onValueChange={(value) => setNewLocation((prev) => ({ ...prev, state: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {indianStates.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="pinCodes">PIN Codes (comma separated)</Label>
                  <Input
                    id="pinCodes"
                    placeholder="400001, 400002"
                    value={newLocation.pinCodes}
                    onChange={(e) => setNewLocation((prev) => ({ ...prev, pinCodes: e.target.value }))}
                  />
                </div>
              </div>

              {/* Coordinates Display */}
              {newLocation.coordinates && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Location Captured</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    Coordinates: {newLocation.coordinates.lat.toFixed(6)}, {newLocation.coordinates.lng.toFixed(6)}
                  </p>
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={handleAddPartnerLocation}
                disabled={!newLocation.city || !newLocation.state}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Location
              </Button>
            </div>
          </div>

          {/* Service Areas */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Service Areas & Pricing</Label>
              <p className="text-sm text-gray-600">
                Where do you provide photography services and what are your rates?
              </p>
            </div>

            {formData.servingLocations.length > 0 && (
              <div className="space-y-2">
                {formData.servingLocations.map((location: string, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <span className="font-medium">{location}</span>
                      <Badge variant="secondary">₹{formData.locationPricing[location]?.toLocaleString()}</Badge>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveServingLocation(location)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="servingLocation">City/Area</Label>
                <Input
                  id="servingLocation"
                  placeholder="Mumbai"
                  value={newServingLocation}
                  onChange={(e) => setNewServingLocation(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="locationPrice">Base Price (₹)</Label>
                <Input
                  id="locationPrice"
                  type="number"
                  placeholder="25000"
                  value={newLocationPrice}
                  onChange={(e) => setNewLocationPrice(e.target.value)}
                />
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleAddServingLocation}
              disabled={!newServingLocation || !newLocationPrice}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Service Area
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-6">
            <Button type="button" variant="outline" onClick={() => goToStep(2)}>
              Back
            </Button>
            <Button
              type="submit"
              disabled={loading || formData.partnerLocations.length === 0 || formData.servingLocations.length === 0}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Continue to Portfolio"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
