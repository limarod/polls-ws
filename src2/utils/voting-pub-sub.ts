

type Message = {pollOptionsId: string, votes: number}
type Subscriber = {message: Message} => void


class VottingPubSub{
    private channels: Record<string, Subscriber[]> = {}

    subscribe(pollId: string, subscriber: Subscriber){
        if (!this.channels[pollId]){
            this.channels[pollId] = []
        }
        
        this.channels[pollId].push(subscriber)
    }


    publish(pollId: string, message: Message){
        if(!this.channels[pollId]){
            return;
        }

        for (const subscriber of this.channels[pollId]){
            subscriber(message)
        }
    }
}

export const voting = new VottingPubSub();