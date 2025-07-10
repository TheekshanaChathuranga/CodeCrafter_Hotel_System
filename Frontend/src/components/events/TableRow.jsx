import React from 'react';
import { Button } from "../ui/button";
import { TableRow as ShadTableRow } from "../ui/table";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "../ui/select";
import { Input } from "../ui/input";

const TableRow = ({ row, index, foodOptions, handleTableChange, removeRow }) => {
  // foodOptions is now an array of objects: { name, unitType, unitPrice }
  const selectedFood = foodOptions.find(item => item.name === row.description);

  return (
    <ShadTableRow>
      <td className="px-4 py-2">{row.no}</td>
      <td className="px-4 py-2">
        <Select
          value={row.description || ""}
          onValueChange={(value) => handleTableChange(index, 'description', value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Food Item" />
          </SelectTrigger>
          <SelectContent>
            {foodOptions.map((option) => (
              <SelectItem key={option._id || option.name} value={option.name}>
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="px-4 py-2">
        <div className="relative w-24">
          <Input
            type="number"
            value={row.quantity}
            onChange={e => handleTableChange(index, 'quantity', e.target.value)}
            min={0}
            className="pr-10"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
            {selectedFood ? (row.quantity === 1 ? selectedFood.unitType : (selectedFood.unitType.endsWith('s') ? selectedFood.unitType : selectedFood.unitType + 's')) : ''}
          </span>
        </div>
      </td>
      <td className="px-4 py-2">
        <Input
          type="number"
          value={selectedFood ? selectedFood.unitPrice : row.rate}
          disabled
        />
      </td>
      <td className="px-4 py-2">{row.amount.toFixed(2)}</td>
      <td className="px-4 py-2">
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => removeRow(index)}
        >
          Remove
        </Button>
      </td>
    </ShadTableRow>
  );
};

export default TableRow; 