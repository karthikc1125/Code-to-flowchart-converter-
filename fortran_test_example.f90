program test_select_case
    implicit none
    integer :: day
    
    day = 3
    
    select case (day)
        case (1)
            print *, "Monday"
        case (2)
            print *, "Tuesday"
        case (3)
            print *, "Wednesday"
        case (4)
            print *, "Thursday"
        case (5)
            print *, "Friday"
        case (6)
            print *, "Saturday"
        case (7)
            print *, "Sunday"
        case default
            print *, "Invalid day"
    end select
    
    print *, "End of program"
end program test_select_case