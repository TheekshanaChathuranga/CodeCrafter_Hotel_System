import React from 'react';
import { Button } from "../ui/button";
import { TableRow as ShadTableRow } from "../ui/table";
import { Input } from "../ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "../ui/select";

const ExtraRow = ({ row, index, unitOptions, handleExtraChange, removeExtraRow }) => {
  return (
    <ShadTableRow>
      <td className="px-4 py-2">{row.no}</td>
      <td className="px-4 py-2">
        <Input
          type="text"
          value={row.description}
          onChange={(e) => handleExtraChange(index, 'description', e.target.value)}
          placeholder="Enter description"
        />
      </td>
      <td className="px-4 py-2">
        <div className="relative w-24">
          <Input
            type="number"
            value={row.quantity}
            onChange={e => handleExtraChange(index, 'quantity', e.target.value)}
            min={0}
            className="pr-10"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
            {row.unit ? (row.quantity === 1 ? row.unit : (row.unit.endsWith('s') ? row.unit : row.unit + 's')) : ''}
          </span>
        </div>
      </td>
      <td className="px-4 py-2">
        <Input
          type="number"
          value={row.rate}
          onChange={(e) => handleExtraChange(index, 'rate', e.target.value)}
          min={0}
          step={0.01}
        />
      </td>
      <td className="px-4 py-2">{row.amount.toFixed(2)}</td>
      <td className="px-4 py-2">
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => removeExtraRow(index)}
        >
          Remove
        </Button>
      </td>
    </ShadTableRow>
  );
};

export default ExtraRow; 