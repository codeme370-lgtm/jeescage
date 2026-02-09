import prisma from "@/lib/prisma"; 


//let's find our user from a prisma

const authSeller = async (userId)=>{
   try{
    const user = await prisma.user.findUnique(
        {
            where:{id:userId},
            include:{store:true}
        }
    )
    //check if user exists
    if(!user){
        return false
    }
    //approving a user
    if(user.store){
    if(user.store.status==='approved'){
        return user.store.id
    }
   }else{
    return false
   }
}catch(error){
    console.error(error)
    return false
   }

}  

export default authSeller;