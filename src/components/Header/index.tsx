import React, { useState, useCallback, useEffect } from "react";
import {
    getNotes,
    searchByTitle,
    fetchTasksByColor,
} from "../../services/noteService";
import AuthService from "../../services/authService";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
    Container,
    Content,
    Input,
    Logo,
    Hand,
    Text,
    Profile,
    Dropdown,
    DropdownContent,
} from "./styles";
import { INote } from "../../interfaces/INote";
import LogoImg from "../../assets/notes.png";
import SelectColor from "../SelectColor";
import { setProfile } from "../../slices/userSlice";

interface HeaderProps {
    searchNote: (note: INote[]) => void;
    findNotes: (note: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ findNotes, searchNote }) => {
    const [search, setSearch] = useState<string>("");
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
    const [showDropdown, setShowDropdown] = useState<boolean>(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const profile = useSelector(
        (state: { user: { profile: any } }) => state.user.profile
    );

    const searchByNoteTitle = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const query = e.target.value;
        setSearch(query);

        try {
            const response = await searchByTitle(query);
            searchNote(response.data.tasks);
            findNotes(true);
        } catch (error: Error | any) {
            console.error("Erro ao buscar notas:", error);
            if (error.message === "Request failed with status code 404") {
                searchNote([]);
            }
        }
    };

    const handleColorSelect = async (color: string) => {
        setSelectedColor(color);
        setShowColorPicker(false);

        try {
            const response = await fetchTasksByColor(color);
            searchNote(response!.data.tasks);
            findNotes(true);
        } catch (error) {
            console.error("Erro ao buscar tarefas por cor:", error);
            searchNote([]);
        }
    };

    const handleLogout = useCallback(() => {
        AuthService.logout();
        navigate("/signin");
    }, [navigate]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profileData = await AuthService.getProfile();
                dispatch(setProfile(profileData));
            } catch (error) {
                console.error("Erro ao buscar perfil:", error);
            }
        };

        fetchProfile();
    }, [dispatch]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getNotes();
                searchNote(response.data.tasks);
            } catch (error) {
                console.error("Erro ao buscar notas:", error);
            }
        };

        if (search === "" && !selectedColor) {
            fetchData();
        }
    }, [searchNote, search, selectedColor]);

    return (
        <Container>
            <Content>
                <Logo src={LogoImg} />
                <Text>CoreNotes</Text>
                <Input
                    type="text"
                    placeholder="Digite ou use a lupa para cor"
                    onChange={(e) => searchByNoteTitle(e)}
                />
                <Hand
                    size={20}
                    onClick={() => setShowColorPicker(!showColorPicker)}
                />
                {showColorPicker && (
                    <SelectColor
                        data={{ id: "color-picker" }}
                        show={showColorPicker}
                        setShow={setShowColorPicker}
                        onSelectColor={handleColorSelect}
                    />
                )}
                <Profile>
                    {profile && (
                        <>
                            <img
                                src={
                                  `https://ui-avatars.com/api/?name=${profile.username}`
                                }
                                alt="Avatar"
                                width={32}
                                style={{ cursor: "pointer", borderRadius: "50%" }}
                                onClick={() => setShowDropdown(!showDropdown)}
                                onError={(e) => {
                                    console.error(
                                        "Erro ao carregar a imagem do avatar:",
                                        e
                                    );
                                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${profile.username}`;
                                }}
                            />
                            {showDropdown && (
                                <Dropdown>
                                    <DropdownContent>
                                        <button onClick={handleLogout}>
                                            Logout
                                        </button>
                                        <Link to="/profile">
                                            <button>Ir para o perfil</button>
                                        </Link>
                                    </DropdownContent>
                                </Dropdown>
                            )}
                        </>
                    )}
                </Profile>
            </Content>
        </Container>
    );
};

export default Header;