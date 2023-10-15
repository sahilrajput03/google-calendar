export const generateHtmlTag = (link: string) => {
  return `
You are not authenticated, please authenticate youself via below button:
<br/>
<a href="${link}">Click to authenticate</a>
`
}
