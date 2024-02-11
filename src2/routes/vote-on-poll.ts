import {prisma} from "../lib/prisma"
import {z} from "zod"
import { FastifyInstance } from "fastify"
import {randomUUID} from "node:crypto"
import { redis } from "../lib/redis"
import { voting } from "../utils/voting-pub-sub"




export async function voteOnPoll (app: FastifyInstance){
    app.post("/polls/:pollsId/votes", async (request, reply) => {
        const voteOnPollBody = z.object({
            pollOptionsId: z.string().uuid()
        })

        const voteOnPollParams = z.object({
            pollsId: z.string().uuid()
        })


    
        const {pollsId} = voteOnPollParams.parse(request.params)
        const {pollOptionsId} = voteOnPollBody.parse(request.body)

      

        let sessionId = request.cookies.sessionId



        if (sessionId){
            const userPreviousVoteonPoll = await prisma.votes.findUnique({
                where:{
                    sessionId_pollsId:{
                        sessionId,
                        pollsId,
                    },
                }
            })
            if (userPreviousVoteonPoll && userPreviousVoteonPoll.pollOptionsId !== pollOptionsId ){
                await prisma.votes.delete({
                    where:{
                        id: userPreviousVoteonPoll.id
                    }
                })

                const votes = await redis.zincrby(pollsId, -1, userPreviousVoteonPoll.pollOptionsId)

                voting.publish(pollsId, {
                    pollOptionsId: userPreviousVoteonPoll.pollOptionsId,
                    votes: Number(votes),
                })

            }else if(userPreviousVoteonPoll){
                
                return reply.status(400).send({message: "You already voted on this poll"})
            }
    
        }
       
        if(!sessionId){

            sessionId = randomUUID()

            reply.setCookie('sessionId', sessionId,{
                path: '/',
                maxAge: 60 * 60 * 24 * 30, //30days
                signed: true,
                httpOnly: true,
            })
        }

        await prisma.votes.create({
            data:{
                sessionId,
                pollOptionsId,
                pollsId
            }
        })

        const pollOption = await prisma.pollOptions.findUnique({
            where:{
                id:pollOptionsId
            }
        })

        const pollOptionTitle = pollOption?.title

       const votes = await redis.zincrby(pollsId, 1, pollOptionsId)

      voting.publish(pollsId, {
        pollOptionsId,
        votes: Number(votes),
      })
    
        return reply.status(201).send()
    
        
    })
} 