## open USB Port

    sudo modprobe ftdi_sio
    echo 17b6 1002 | sudo tee /sys/bus/usb-serial/drivers/ftdi_sio/new_id
    ls /dev/ttyUSB*
