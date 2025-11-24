program NestedIf;
var
  x, y: integer;
begin
  if x > 0 then
  begin
    if y > 0 then
      writeln('Both positive')
    else
      writeln('Only x is positive');
  end;
end.