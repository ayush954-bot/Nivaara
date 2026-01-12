import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Locations</SelectItem>
        
        {/* Pune Zones Group */}
        <SelectGroup>
          <SelectLabel className="font-semibold text-primary">Pune Zones</SelectLabel>
          <SelectItem value="Pune - East Zone">Pune - East Zone</SelectItem>
          <SelectItem value="Pune - West Zone">Pune - West Zone</SelectItem>
          <SelectItem value="Pune - North Zone">Pune - North Zone</SelectItem>
          <SelectItem value="Pune - South Zone">Pune - South Zone</SelectItem>
          <SelectItem value="Pune - Pimpri-Chinchwad">Pune - Pimpri-Chinchwad</SelectItem>
          <SelectItem value="Purandar">Purandar</SelectItem>
          <SelectItem value="Pune">Pune (General)</SelectItem>
        </SelectGroup>
        
        {/* Major Indian Cities Group */}
        <SelectGroup>
          <SelectLabel className="font-semibold text-primary">India</SelectLabel>
          <SelectItem value="Mumbai">Mumbai</SelectItem>
          <SelectItem value="Delhi NCR">Delhi NCR</SelectItem>
          <SelectItem value="Bangalore">Bangalore</SelectItem>
          <SelectItem value="Hyderabad">Hyderabad</SelectItem>
          <SelectItem value="Chennai">Chennai</SelectItem>
          <SelectItem value="Kolkata">Kolkata</SelectItem>
          <SelectItem value="Ahmedabad">Ahmedabad</SelectItem>
          <SelectItem value="Surat">Surat</SelectItem>
          <SelectItem value="Jaipur">Jaipur</SelectItem>
          <SelectItem value="Lucknow">Lucknow</SelectItem>
          <SelectItem value="Nagpur">Nagpur</SelectItem>
          <SelectItem value="Indore">Indore</SelectItem>
          <SelectItem value="Thane">Thane</SelectItem>
          <SelectItem value="Bhopal">Bhopal</SelectItem>
          <SelectItem value="Visakhapatnam">Visakhapatnam</SelectItem>
          <SelectItem value="Patna">Patna</SelectItem>
          <SelectItem value="Vadodara">Vadodara</SelectItem>
          <SelectItem value="Ghaziabad">Ghaziabad</SelectItem>
          <SelectItem value="Ludhiana">Ludhiana</SelectItem>
        </SelectGroup>
        
        {/* International Group */}
        <SelectGroup>
          <SelectLabel className="font-semibold text-primary">International</SelectLabel>
          <SelectItem value="Dubai, UAE">Dubai, UAE</SelectItem>
          <SelectItem value="Abu Dhabi, UAE">Abu Dhabi, UAE</SelectItem>
          <SelectItem value="Sharjah, UAE">Sharjah, UAE</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
