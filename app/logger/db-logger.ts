import { SystemLog } from "db/models";

export async function logToDB({
  origin,
  message,
  status,
  payload,
}: {
  origin: string;
  message: string;
  status: string | null;
  payload: string | null;
}) {
  console.log('logging to db!');

  await SystemLog.create({
    origin: origin,
    message: message,
    status: status,
    payload: payload,
  });
}
