import { Button } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';

function App() {
  return (
    <>
      <h1>Vite + React + Tailwind + MaterialUI/Icons</h1>
      <Button variant="contained" startIcon={<HomeIcon />}>
        Home
      </Button>
    </>
  )
}

export default App
