ิี## จากเครื่อง build
docker save -o all_services.tar auth-service:latest data-service:latest interface-service:latest moisture-sensor:latest moisture-sensor-fe:latest

## Raspberry Pi
docker load -i all_services.tar

docker-compose -f docker-compose.run.yml up -d