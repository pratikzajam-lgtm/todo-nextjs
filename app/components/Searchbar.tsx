import * as React from "react";
import { TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

type Props = {
  onSearch: (value: string) => void;
};

export default function SearchBar({ onSearch }: Props) {
  const [query, setQuery] = React.useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value); 
  };

  return (
    <TextField
      fullWidth
      placeholder="Search..."
      value={query}
      onChange={handleChange}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
      }}
    />
  );
}