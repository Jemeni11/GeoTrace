import { useState, useEffect, useCallback } from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  useMap,
  Marker,
  Tooltip,
  ZoomControl,
} from "react-leaflet";

const myIcon = L.icon({
  iconUrl: "./icon-location.svg",
});

function LocationMarker({
  position,
  ipaddress,
}: {
  position: { lat: number; lng: number };
  ipaddress: string;
}) {
  const mapMe = useMap();
  mapMe.flyTo(position);

  return (
    <Marker position={position} icon={myIcon}>
      <Tooltip>IP Address {ipaddress} is located here.</Tooltip>
    </Marker>
  );
}

function App() {
  const [IPAddress, setIPAddress] = useState("8.8.8.8");
  const [fetchedAddressData, setFetchedAddressData] = useState({
    IPAddress: " - ",
    Location: " - ",
    Timezone: "- ",
    ISP: "- ",
  });
  const [position, setPosition] = useState({ lat: 37.38605, lng: -122.08385 });
  const IP_GEOLOCATION_API_KEY = import.meta.env.VITE_IP_GEOLOCATION_API_KEY;

  const getIPAddressData = useCallback(
    async (ipToLookup: string) => {
      if (ipToLookup.trim() === "") return;

      const API_URL = `https://geo.ipify.org/api/v2/country,city?apiKey=${IP_GEOLOCATION_API_KEY}&ipAddress=${ipToLookup}`;
      const res = await fetch(API_URL);

      if (res.ok) {
        const data = await res.json();
        console.log(data);
        console.table(data);
        setFetchedAddressData({
          IPAddress: data.ip,
          Location: `${data.location.city}, ${data.location.region}\n${data.location.postalCode}`,
          Timezone: data.location.timezone,
          ISP: data.isp,
        });
        setPosition({ lat: data.location.lat, lng: data.location.lng });
      } else {
        console.error(res);
        alert(`${res.status} error: ${res.statusText || "Error"}`);
      }
    },
    [IP_GEOLOCATION_API_KEY]
  );

  useEffect(() => {
    getIPAddressData(IPAddress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formSubmitHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    getIPAddressData(IPAddress);
  };

  return (
    <div className="App">
      <div className="Header">
        <h1>GeoTrace</h1>
        <form onSubmit={formSubmitHandler} className="IP_InputContainer">
          <input
            type="text"
            name="IP_Input"
            id="IP_Input"
            value={IPAddress}
            onChange={(e) => setIPAddress(e.target.value)}
            placeholder="Search for any IP address or domain"
          />
          <button type="submit">
            <img
              src="/icon-arrow.svg"
              alt="Search Button"
              width="11"
              height="14"
            />
          </button>
        </form>
        <div className="IP_DetailsContainer">
          <div className="IP_Details">
            <div>
              <small>IP ADDRESS</small>
              <p>{fetchedAddressData.IPAddress || "Nil"}</p>
            </div>
            <div>
              <small>LOCATION</small>
              <p>
                {fetchedAddressData.Location.trim() === ","
                  ? "Nil"
                  : fetchedAddressData.Location}
              </p>
            </div>
            <div>
              <small>TIMEZONE</small>
              <p>
                {fetchedAddressData.Timezone
                  ? `UTC ${fetchedAddressData.Timezone}`
                  : "Nil"}
              </p>
            </div>
            <div>
              <small>ISP</small>
              <p>{fetchedAddressData.ISP || "Nil"}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="Map">
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: "inherit" }}
          zoomControl={false}
        >
          <ZoomControl position="bottomleft" />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} ipaddress={IPAddress} />
        </MapContainer>
      </div>
    </div>
  );
}

export default App;
