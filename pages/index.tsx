import { useQuery } from "@tanstack/react-query";
import type { NextPage } from "next";

import axios from "axios";
import { useEffect, useMemo } from "react";
import useSound from "use-sound";

type Data = {
  name: string;
  status: string;
};

const api = axios.create({
  baseURL: "api",
});

const fetchData = async () => {
  const { data } = await api.get<Data[]>("/hello");
  return data;
};

const usePlaySounds = (data: Data[] | undefined) => {
  const [playCrowd, { stop: stopCrowd }] = useSound("/crowd.mp3");
  const [playMan, { stop: stopMan }] = useSound("/man.mp3");
  const server = process.env.NEXT_PUBLIC_SERVER;

  useEffect(() => {
    if (data?.find((name) => name.name === server && name.status === "good")) {
      playCrowd();

      setTimeout(() => {
        playMan();
      }, 3 * 1000);

      setTimeout(() => {
        stopCrowd();
        stopMan();
      }, 16 * 1000);
    }

    return () => {
      stopCrowd();
      stopMan();
    };
  }, [data, playCrowd, playMan, server, stopCrowd, stopMan]);
};

const Home: NextPage = () => {
  const { isLoading, data } = useQuery(["names"], fetchData, {
    refetchInterval: 6000,
  });

  usePlaySounds(data);

  if (isLoading) return <div>Loading data</div>;
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
      }}
    >
      {data?.find(
        (name) =>
          name.name === process.env.NEXT_PUBLIC_SERVER && name.status === "good"
      ) ? (
        <h1 style={{ fontWeight: "800", fontSize: "300px", color: "green" }}>
          ONLINE
        </h1>
      ) : (
        <h1 style={{ fontWeight: "800", fontSize: "300px", color: "red" }}>
          OFFLINE
        </h1>
      )}
    </div>
  );
};

export default Home;
