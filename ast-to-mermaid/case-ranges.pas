program CaseRanges;
var
  y: integer;
begin
  case y of
    1..10: writeln('Small range');
    11..20: writeln('Medium range');
    else writeln('Large number');
  end;
end.