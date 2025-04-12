import { useNavStore } from "../store/useNavStore";
import { useNavigate } from "react-router-dom";
import './NavbarItem.css'

interface Props {
    imageURI: string,
    imageURIH: string,
    text: string,
}

function NavbarItem(p: Props) {

    const { selectedNavPage, setSelectedNavPage } = useNavStore();
    const navigate = useNavigate();

    const handleClick = () => {
        setSelectedNavPage(p.text)
        navigate(`/${p.text}`)
    }

    return (
        <div className={`flex flex-row items-center gap-2 rounded-3xl transition-colors duration-300 ml-3 mr-3 pl-4 pr-2 pt-2 pb-2 ${selectedNavPage == p.text ? "selected" : "deselected"}`}
            onClick={handleClick}>
            <img src={(selectedNavPage == p.text ? p.imageURIH : p.imageURI)} className="w-6 h-6 mr-1" />
            <span className={`text-lg text-[${selectedNavPage == p.text ? "#243954" : "#88888A"}]`}>
                {p.text}
            </span>
        </div>
    )
}

export default NavbarItem