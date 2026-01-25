import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { groupLocations } from "@/lib/locations";

interface LocationSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function LocationSelect({
  value,
  onValueChange,
  placeholder = "Select Location",
  className,
}: LocationSelectProps) {
  // Fetch unique locations from database
  const { data: locations = [], isLoading } = trpc.properties.getLocations.useQuery();

  // Use smart grouping function
  const groupedLocations = groupLocations(locations);

  return (
    <Select value={value} onValueChange={onValueChange} disabled={isLoading}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={isLoading ? "Loading..." : placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Locations</SelectItem>
        
        {/* Pune Zones Group */}
        {groupedLocations.puneZones.length > 0 && (
          <SelectGroup>
            <SelectLabel className="font-semibold text-primary">Pune Zones</SelectLabel>
            {groupedLocations.puneZones.map((location) => (
              <SelectItem key={location} value={location}>
                {location}
              </SelectItem>
            ))}
          </SelectGroup>
        )}
        
        {/* Indian Cities Group */}
        {groupedLocations.india.length > 0 && (
          <SelectGroup>
            <SelectLabel className="font-semibold text-primary">India</SelectLabel>
            {groupedLocations.india.map((location) => (
              <SelectItem key={location} value={location}>
                {location}
              </SelectItem>
            ))}
          </SelectGroup>
        )}
        
        {/* International Group */}
        {groupedLocations.international.length > 0 && (
          <SelectGroup>
            <SelectLabel className="font-semibold text-primary">International</SelectLabel>
            {groupedLocations.international.map((location) => (
              <SelectItem key={location} value={location}>
                {location}
              </SelectItem>
            ))}
          </SelectGroup>
        )}
      </SelectContent>
    </Select>
  );
}
