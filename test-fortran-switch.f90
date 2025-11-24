program test_switch
    implicit none
    integer :: x = 2

    select case (x)
        case (1)
            print *, "x is 1"
        case (2)
            print *, "x is 2"
        case (3)
            print *, "x is 3"
        case default
            print *, "x is something else"
    end select

    print *, "After switch statement"
end program test_switch