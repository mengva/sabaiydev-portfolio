import { Spinner } from '@workspace/ui/components/spinner'

function LoadingComponent() {
    return (
        <div className="w-full min-h-screen flex justify-center items-center">
            <div className="text-2xl! flex gap-2 items-center">
                <Spinner className="w-6 h-6" />
                Loading...
            </div>
        </div>
    )
}

export default LoadingComponent
