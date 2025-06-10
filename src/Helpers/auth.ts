export const setFlagToLS = (flag: string) => {
  return localStorage.setItem("flag", flag)
}

export const getFlagFromLS = () => {
  return localStorage.getItem("flag") || ""
}
