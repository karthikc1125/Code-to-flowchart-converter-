program TestComplexConditional;
var
  x, y: integer;
begin
  // Complex nested if statements
  if x > 0 then
  begin
    if y > 0 then
      writeln('Both positive')
    else if y < 0 then
      writeln('x positive, y negative')
    else
      writeln('x positive, y zero');
  end
  else if x < 0 then
    writeln('x negative')
  else
    writeln('x zero');
    
  // Case statement with ranges
  case x of
    1: writeln('One');
    2..5: writeln('Between 2 and 5');
    6, 7, 8: writeln('Six, seven, or eight');
    else writeln('Other value');
  end;
end.