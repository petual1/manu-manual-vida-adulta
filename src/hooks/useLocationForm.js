import { useState, useEffect } from 'react';

export default function useLocationForm(initialData = {}) {
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [selectedState, setSelectedState] = useState(initialData?.address?.state || '');
    const [selectedCity, setSelectedCity] = useState(initialData?.address?.city || '');

    useEffect(() => {
        fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
            .then(res => res.json())
            .then(setStates);
    }, []);

    useEffect(() => {
        if (selectedState) {
            const selectedStateData = states.find(s => s.sigla === selectedState);
            if (selectedStateData) {
                fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedStateData.id}/municipios?orderBy=nome`)
                    .then(res => res.json())
                    .then(citiesData => {
                        setCities(citiesData.map(c => c.nome));
                        if (initialData?.address?.city && selectedState === initialData.address.state) {
                            setSelectedCity(initialData.address.city);
                        }
                    });
            }
        } else {
            setCities([]);
        }
    }, [selectedState, states, initialData?.address]);
    
    const handleCepBlur = async (e, callback) => {
        const cep = e.target.value.replace(/\D/g, '');
        
        if (cep.length === 8) {
            try {
                const data = await fetch(`https://viacep.com.br/ws/${cep}/json/`).then(res => res.json());
                
                if (!data.erro) {
                    setSelectedState(data.uf);
                    setSelectedCity(data.localidade);
                    
                    callback({
                        street: data.logradouro,
                        neighborhood: data.bairro
                    });
                    
                } else {
                    alert('CEP não encontrado. Verifique se é um CEP genérico.');
                }
            } catch (error) {
                console.error("Erro ao buscar CEP:", error);
                alert('Erro ao buscar o CEP.');
            }
        }
    };
    
    const formatCep = (e) => {
        let value = e.target.value.replace(/\D/g, '').slice(0, 8);
        if (value.length > 5) value = value.replace(/^(\d{5})(\d)/, '$1-$2');
        e.target.value = value;
    };

    return { states, cities, selectedState, setSelectedState, selectedCity, setSelectedCity, handleCepBlur, formatCep };
}