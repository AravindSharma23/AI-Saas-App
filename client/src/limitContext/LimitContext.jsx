import { useEffect, useState } from "react";
import { createContext } from "react";

export const PremiumLimitContext = createContext()

export const LimitProvider = ({children}) =>{

    const [limit,setLimit] = useState(0);
    console.log(limit);
    

    useEffect(()=>{
        const savedLimit = localStorage.getItem('limit')
        if(savedLimit){
            setLimit(Number(savedLimit));
        }
    },[])

    const setPremiumLimit = ()=>{ 
        setLimit((prev) => {
        const newLimit = prev + 1;
        localStorage.setItem('limit', newLimit); // save updated value
        return newLimit;
  });
}

    return <PremiumLimitContext.Provider value={{limit,setPremiumLimit}}>
        {children}
    </PremiumLimitContext.Provider>
}