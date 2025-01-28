import React, { useState } from "react";
import { Camera } from "lucide-react";
import RelationshipDropdown from "@/app/components/RelastionShipDropDown";
import CountryCodeDropdown from "@/app/components/CountryCodeDropDown";

interface ContactState {
  relationship: string;
  name: string;
  phoneNumber: string;
  countryCode: string;
  callingCode: string;
  location: string;
  profilePicture: string;
  secretMessage: string;
}

const EmergencyContactForm: React.FC = () => {
  const [contact, setContact] = useState<ContactState>({
    relationship: "",
    name: "",
    phoneNumber: "",
    countryCode: "GB",
    callingCode: "+44",
    location: "",
    profilePicture: "",
    secretMessage: "",
  });

  const [errors, setErrors] = useState<Partial<ContactState>>({});

  const validateForm = () => {
    const newErrors: Partial<ContactState> = {};

    if (!contact.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!contact.relationship) {
      newErrors.relationship = "Relationship is required";
    }

    if (!contact.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^\d{1,15}$/.test(contact.phoneNumber.trim())) {
      newErrors.phoneNumber = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size should not exceed 5MB");
        return;
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file");
        return;
      }

      const imageUrl = URL.createObjectURL(file);
      setContact((prev) => ({ ...prev, profilePicture: imageUrl }));
    }
  };

  const handleSave = async () => {
    try {
      if (!validateForm()) {
        return;
      }

      // Construct the final contact data
      const contactData = {
        ...contact,
        phoneNumber: `${contact.callingCode}${contact.phoneNumber.replace(
          /\D/g,
          ""
        )}`,
        timestamp: new Date().toISOString(),
      };

      // Add your API call here
      console.log("Saving contact:", contactData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      alert("Contact saved successfully!");

      // Reset form or redirect as needed
      // window.location.href = "/contacts"; // Uncomment to redirect after save
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to save contact");
    }
  };

  return (
    <div className='max-w-2xl mx-auto p-4'>
      {/* Top Bar */}
      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-2xl font-bold'>Add Emergency Contact</h1>
        <button
          type='button'
          onClick={handleSave}
          className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
        >
          Save
        </button>
      </div>

      {/* Profile Picture */}
      <div className='flex justify-center mb-6'>
        <div className='relative'>
          <img
            src={contact.profilePicture || "/api/placeholder/100/100"}
            alt='Profile'
            className='w-24 h-24 rounded-full object-cover border-2 border-gray-200'
          />
          <label
            htmlFor='photo-upload'
            className='absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full cursor-pointer hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          >
            <Camera className='w-5 h-5 text-white' />
            <input
              id='photo-upload'
              type='file'
              accept='image/*'
              className='hidden'
              onChange={handlePhotoUpload}
            />
          </label>
        </div>
      </div>

      {/* Form Fields */}
      <div className='space-y-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Relationship<span className='text-red-500'>*</span>
          </label>
          <RelationshipDropdown
            selected={contact.relationship}
            onSelect={(relationship: any) =>
              setContact((prev) => ({ ...prev, relationship }))
            }
          />
          {errors.relationship && (
            <p className='mt-1 text-sm text-red-500'>{errors.relationship}</p>
          )}
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Name<span className='text-red-500'>*</span>
          </label>
          <input
            type='text'
            value={contact.name}
            onChange={(e) =>
              setContact((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder='Enter contact name'
            className='w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none'
          />
          {errors.name && (
            <p className='mt-1 text-sm text-red-500'>{errors.name}</p>
          )}
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Phone Number<span className='text-red-500'>*</span>
          </label>
          <div className='flex gap-2'>
            <CountryCodeDropdown
              onSelect={(country: { code: any; dialCode: any }) =>
                setContact((prev) => ({
                  ...prev,
                  countryCode: country.code,
                  callingCode: country.dialCode,
                }))
              }
              defaultCountry={contact.countryCode}
            />
            <input
              type='tel'
              value={contact.phoneNumber}
              onChange={(e) =>
                setContact((prev) => ({ ...prev, phoneNumber: e.target.value }))
              }
              placeholder='Enter phone number'
              className='flex-1 px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none'
            />
          </div>
          {errors.phoneNumber && (
            <p className='mt-1 text-sm text-red-500'>{errors.phoneNumber}</p>
          )}
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Location
          </label>
          <input
            type='text'
            value={contact.location}
            onChange={(e) =>
              setContact((prev) => ({ ...prev, location: e.target.value }))
            }
            placeholder='Enter location'
            className='w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Secret Message
          </label>
          <input
            type='text'
            value={contact.secretMessage}
            onChange={(e) =>
              setContact((prev) => ({ ...prev, secretMessage: e.target.value }))
            }
            placeholder='Enter a secret message'
            className='w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none'
          />
        </div>
      </div>
    </div>
  );
};

export default EmergencyContactForm;
