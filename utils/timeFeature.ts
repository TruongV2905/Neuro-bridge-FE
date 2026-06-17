import moment from "moment";
import "moment-timezone";

moment.tz.setDefault("Asia/Ho_Chi_Minh");

const DEFAULT_TIMEZONE = "Asia/Ho_Chi_Minh";

export const getCurrentDateTime = () => {
  return moment().format("MMMM Do YYYY, h:mm:ss a");
};

export const getCurrentDateTimeVietnam = () => {
  return moment().tz(DEFAULT_TIMEZONE).format("MMMM Do YYYY, h:mm:ss a");
};

export const formatDateTimeVietnam = (date?: string | Date | null) => {
  if (!date) return "—";

  return moment(date).tz(DEFAULT_TIMEZONE).format("DD/MM/YYYY HH:mm");
};

export const getDifTime = (dateStart?: string | Date | null) => {
  if (!dateStart) return "—";

  return moment(dateStart).tz(DEFAULT_TIMEZONE).fromNow();
};
  