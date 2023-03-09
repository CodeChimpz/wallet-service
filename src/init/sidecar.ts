import {AmqpBroker, HttpCommunication, EtcdRegistry} from "mein-etcd-service-registry";
import {config} from "dotenv";


config()
const {
    ETCD_HOST,
    SERVICE_NAME,
    SERVICE_URL,
    SELF_KEY,
} = process.env
//
const endpointObject = {}
//
export const registry = new EtcdRegistry.ServiceRegistry({
    hosts: String(ETCD_HOST)
}, {
    serviceUrl: String(SERVICE_URL),
    refer: String(SERVICE_NAME),
    endpoints: endpointObject
})
await registry.init()
export const sidecar = new HttpCommunication.Sidecar(registry, String(SELF_KEY))
//
export const commiter = new HttpCommunication.TransactionSync(sidecar)