program CaseSimple;
var
  x: integer;
begin
  case x of
    1: writeln('One');
    2: writeln('Two');
    3: writeln('Three');
    else writeln('Other number');
  end;
end.