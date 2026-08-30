import Login from "./login";
import CreateRoom from "./createRoom";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Room from "./Room";
function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/join" element={<Login />} />
                <Route path="/create" element={<CreateRoom />} />
                <Route path="/room/:roomId" element={<Room/>}></Route>
            </Routes>
        </BrowserRouter>
    );
}
export default App;