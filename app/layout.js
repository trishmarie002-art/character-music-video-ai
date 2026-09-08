export const metadata = {
  title: 'Character Music Video AI',
  description: 'Turn a character and song into an AI music video.'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{margin:0,fontFamily:'Arial, sans-serif',background:'#0b0b12',color:'#fff'}}>{children}</body>
    </html>
  )
}
