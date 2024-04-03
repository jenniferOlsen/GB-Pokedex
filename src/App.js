import { useEffect, useState } from "react";
import { fetchAllPokemon, fetchEvolutionChainById, fetchPokemonDetailsByName } from "./api";

function App() {
    const [pokemonIndex, setPokemonIndex] = useState([])
    const [pokemon, setPokemon] = useState([])
    const [searchValue, setSearchValue] = useState('')
    const [pokemonDetails, setPokemonDetails] = useState()

    useEffect(() => {
        const fetchPokemon = async () => {
            const { results: pokemonList } = await fetchAllPokemon()

            setPokemon(pokemonList)
            setPokemonIndex(pokemonList)
        }

        fetchPokemon().then(() => {
            /** noop **/
        })
    }, [])

    const onSearchValueChange = (event) => {
        const value = event.target.value
        setSearchValue(value)

        const filteredPokemon = pokemonIndex.filter(monster => monster.name.includes(value))
        setPokemon(filteredPokemon)
    }

    const onGetDetails = (name) => async () => {
        const details = {
            name: name,
            types: [],
            moves: [],
            evolution: [],
            id: null
        }
        const { id, types, moves } = await fetchPokemonDetailsByName(name)
        const { chain } = await fetchEvolutionChainById(id)

        details.id = id
        details.types = types
        details.moves = moves
        details.evolution.push(chain.species.name)

        const getEvolutionChain = (chain) => {
            if (chain.evolves_to.length > 0) {
                chain.evolves_to.forEach(evolution => {
                    details.evolution.push(evolution.species.name)
                    getEvolutionChain(evolution)
                })
            }
        }
        getEvolutionChain(chain)

        setPokemonDetails(details)

        // Move focus to detail card so it's announced for screen readers
        document.getElementById(details.id).focus();
    }

    return (
        <div className={'pokedex__container'}>
            <div className={'pokedex__search-input'}>
                <input value={searchValue} onChange={onSearchValueChange} placeholder={'Search Pokemon'} aria-label="Search Pokemon" />
            </div>
            <div className={'pokedex__content'}>
                {pokemon.length > 0 ? (
                    <div className={'pokedex__search-results'}>
                        {
                            pokemon.map(monster => {
                                return (
                                    <div className={'pokedex__list-item'} key={monster.name}>
                                        <div>
                                            {monster.name}
                                        </div>
                                        <button onClick={onGetDetails(monster.name)} aria-label={`Get details for ${monster.name}`}>Get Details</button>
                                    </div>
                                )
                            })
                        }
                    </div>
                ) : <p>No Results Found</p>}
                {
                    pokemonDetails && (
                        <div className={'pokedex__details'}>
                            <h1 className={'pokedex__details_name'} tabIndex={-1} id={pokemonDetails.id}>{pokemonDetails.name}</h1>
                            <div className={'pokedex__details_types'}>
                                {pokemonDetails.types.length > 0 ?
                                    <div>
                                        <h2>Types</h2>
                                        <ul>
                                            {pokemonDetails.types.map(type => {
                                                return <li key={type.type.name}>{type.type.name}</li>
                                            })}
                                        </ul>
                                    </div>
                                    : <p>No Types</p>}
                                {pokemonDetails.moves.length > 0 ?
                                    <div>
                                        <h2>Moves</h2>
                                        <ul>
                                            {pokemonDetails.moves.map(moves => {
                                                return <li key={moves.move.name}>{moves.move.name}</li>
                                            })}
                                        </ul>
                                    </div>
                                    : <p>No Moves</p>}
                            </div>
                            {pokemonDetails.evolution.length > 0 ?
                                <div className={'pokedex__details_evolutions'}>
                                    <h2>Evolutions</h2>
                                    <ul>
                                        {pokemonDetails.evolution.map(evolution => {
                                            return <li key={evolution}>{evolution}</li>
                                        })}
                                    </ul>
                                </div>
                                : <p>No Evolutions</p>}
                        </div>
                    )
                }
            </div>
        </div>
    );
}

export default App;
