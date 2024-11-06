interface SearchBarProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
  }
  
  export const SearchBar = ({ searchTerm, onSearchChange }: SearchBarProps) => (
    <div style={{ marginBottom: '1rem' }}>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search by Name or Description"
        style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}
      />
    </div>
  );
  