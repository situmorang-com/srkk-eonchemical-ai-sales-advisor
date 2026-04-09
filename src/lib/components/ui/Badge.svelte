<script lang="ts">
	export let variant: 'green' | 'red' | 'yellow' | 'blue' | 'gray' | 'purple' = 'gray';
</script>

<span class="badge badge-{variant}"><slot /></span>
