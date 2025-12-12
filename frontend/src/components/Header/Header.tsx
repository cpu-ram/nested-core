const Header = ({ downloadData }: { downloadData: () => void }) => {
  return (
    <header>
      <nav>
        <button onClick={downloadData}>Export Data</button>
      </nav>
    </header>
  )
}

export default Header;