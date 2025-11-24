program test_no_direct_connection
    implicit none
    integer :: x = 2
    
    select case (x)
        case (1)
            print *, "Case 1"
        case (2)
            print *, "Case 2"
        case default
            print *, "Default case"
    end select
    
    print *, "After switch statement"
end program test_no_direct_connection